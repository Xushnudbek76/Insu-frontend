import { useCallback, useEffect, useRef, useState } from 'react';
import { useApolloClient, useReactiveVar } from '@apollo/client/react';
import { io } from 'socket.io-client';
import { userVar } from '@/apollo/store';
import { getJwtToken } from '@/libs/auth';
import {
  GET_CONVERSATION,
  GET_CONVERSATION_MESSAGES,
  GET_MY_CONVERSATIONS,
} from '@/apollo/chat/query';
import {
  MARK_CONVERSATION_READ,
  SEND_CONVERSATION_MESSAGE,
  START_PACKAGE_CONVERSATION,
} from '@/apollo/chat/mutation';
import { GET_CONVERSATION_OFFERS } from '@/apollo/policy/query';
import {
  ACCEPT_POLICY_OFFER,
  CONFIRM_POLICY_PAYMENT,
  DECLINE_POLICY_OFFER,
  SEND_POLICY_OFFER,
  WITHDRAW_POLICY_OFFER,
} from '@/apollo/policy/mutation';
import { mergeMessages, recoverMessageGap } from './helpers';
import type {
  ChatMessage,
  Conversation,
  PolicyOffer,
  OfferAction,
} from './types';
const validId = (value?: string) => !!value && /^[a-f\d]{24}$/i.test(value);
export function useMessages({
  conversationId,
  packageId,
  onSelect,
}: {
  conversationId?: string;
  packageId?: string;
  onSelect: (id: string) => void;
}) {
  const client = useApolloClient(),
    user = useReactiveVar(userVar),
    userId = user?._id ?? '';
  const [inboxOwner, setInboxOwner] = useState(''),
    [dataKey, setDataKey] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]),
    [total, setTotal] = useState(0);
  const [selectedConversation, setSelected] = useState<Conversation | null>(
      null,
    ),
    [messages, setMessages] = useState<ChatMessage[]>([]),
    [offers, setOffers] = useState<PolicyOffer[]>([]);
  const [cursor, setCursor] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const key = `${userId}:${conversationId ?? ''}`,
    liveKey = useRef(key),
    mounted = useRef(true),
    inboxPages = useRef(1),
    pendingMessage = useRef<{ key: string; text: string; id: string } | null>(
      null,
    ),
    readMarker = useRef(''),
    historyReady = useRef(false),
    latestMessageId = useRef('');
  liveKey.current = key;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    setConversations([]);
    setSelected(null);
    setMessages([]);
    setOffers([]);
    setCursor(null);
    setError('');
    setBusy(false);
    pendingMessage.current = null;
    inboxPages.current = 1;
  }, [userId]);
  useEffect(() => {
    setSelected(null);
    setMessages([]);
    setOffers([]);
    setCursor(null);
    setError('');
    pendingMessage.current = null;
    readMarker.current = '';
    historyReady.current = false;
    latestMessageId.current = '';
    setBusy(false);
  }, [key]);
  const active = useCallback(
    (requestKey: string) => mounted.current && requestKey === liveKey.current,
    [],
  );
  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const requestKey = key;
    try {
      const inboxPagesResult = await Promise.all(
        Array.from({ length: inboxPages.current }, (_, page) =>
          client.query<{
            getMyConversations: { list: Conversation[]; total: number };
          }>({
            query: GET_MY_CONVERSATIONS,
            variables: { page: page + 1, limit: 20 },
            fetchPolicy: 'no-cache',
          }),
        ),
      );
      if (!active(requestKey)) return;
      setInboxOwner(userId);
      setConversations(
        Array.from(
          new Map(
            inboxPagesResult
              .flatMap((result) => result.data?.getMyConversations.list ?? [])
              .map((row) => [row._id, row]),
          ).values(),
        ),
      );
      setTotal(inboxPagesResult[0]?.data?.getMyConversations.total ?? 0);
      if (!conversationId) return;
      if (!validId(conversationId)) throw new Error('Conversation unavailable');
      const [thread, history, quote] = await Promise.all([
        client.query<{ getConversation: Conversation }>({
          query: GET_CONVERSATION,
          variables: { conversationId },
          fetchPolicy: 'no-cache',
        }),
        client.query<{
          getConversationMessages: {
            list: ChatMessage[];
            nextCursor: string | null;
          };
        }>({
          query: GET_CONVERSATION_MESSAGES,
          variables: { conversationId },
          fetchPolicy: 'no-cache',
        }),
        client.query<{ getConversationOffers: { list: PolicyOffer[] } }>({
          query: GET_CONVERSATION_OFFERS,
          variables: { conversationId },
          fetchPolicy: 'no-cache',
        }),
      ]);
      if (!active(requestKey)) return;
      const c = thread.data?.getConversation;
      const page = await recoverMessageGap(
        history.data?.getConversationMessages ?? { list: [], nextCursor: null },
        latestMessageId.current,
        async (before) => {
          if (!active(requestKey)) throw new Error('Conversation changed');
          const older = await client.query<{
            getConversationMessages: {
              list: ChatMessage[];
              nextCursor: string | null;
            };
          }>({
            query: GET_CONVERSATION_MESSAGES,
            variables: { conversationId, before },
            fetchPolicy: 'no-cache',
          });
          return (
            older.data?.getConversationMessages ?? {
              list: [],
              nextCursor: null,
            }
          );
        },
      );
      if (!active(requestKey)) return;
      latestMessageId.current = page.list.at(-1)?._id ?? '';
      setDataKey(requestKey);
      setSelected(c ?? null);
      setMessages((prev) => mergeMessages(prev, page?.list ?? []));
      setOffers(quote.data?.getConversationOffers.list ?? []);
      if (!historyReady.current) {
        setCursor(page?.nextCursor ?? null);
        historyReady.current = true;
      }
      setError('');
      const latest = page?.list.at(-1);
      if (
        c?.unreadCount &&
        latest &&
        readMarker.current !== latest._id &&
        !document.hidden &&
        document.hasFocus()
      ) {
        readMarker.current = latest._id;
        try {
          await client.mutate({
            mutation: MARK_CONVERSATION_READ,
            variables: { conversationId, messageId: latest._id },
            fetchPolicy: 'no-cache',
          });
          if (active(requestKey))
            setConversations((prev) =>
              prev.map((row) =>
                row._id === conversationId ? { ...row, unreadCount: 0 } : row,
              ),
            );
        } catch {
          readMarker.current = '';
        }
      }
    } catch (e) {
      if (active(requestKey)) {
        setError((e as Error).message);
        setConversations([]);
        setInboxOwner('');
        setTotal(0);
        setCursor(null);
        historyReady.current = false;
        latestMessageId.current = '';
        setSelected(null);
        setMessages([]);
        setOffers([]);
      }
    } finally {
      if (active(requestKey)) setLoading(false);
    }
  }, [client, userId, conversationId, key, active]);
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    void refresh();
    const onFocus = () => {
      if (!document.hidden) void refresh();
    };
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, 15000);
    const url = (
      process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3007'
    ).replace(/\/$/, '');
    const socket = io(`${url}/agent-chat`, { auth: { token: getJwtToken() } });
    socket.on('connect', onFocus);
    socket.on('conversation:updated', onFocus);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.clearInterval(timer);
      socket.disconnect();
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refresh, userId]);
  useEffect(() => {
    if (!userId || !packageId || conversationId) return;
    const requestKey = key;
    if (!validId(packageId)) {
      setError('Package agent unavailable');
      return;
    }
    void client
      .mutate<{ startPackageConversation: { _id: string } }>({
        mutation: START_PACKAGE_CONVERSATION,
        variables: { packageId },
        fetchPolicy: 'no-cache',
      })
      .then((result) => {
        if (active(requestKey) && result.data?.startPackageConversation)
          onSelect(result.data.startPackageConversation._id);
      })
      .catch((e) => {
        if (active(requestKey)) setError(e.message);
      });
  }, [client, userId, packageId, conversationId, onSelect, key, active]);
  const perform = async (mutation: any, variables: Record<string, unknown>) => {
    if (busy || !userId) return false;
    const requestKey = key;
    setBusy(true);
    setError('');
    try {
      await client.mutate({ mutation, variables, fetchPolicy: 'no-cache' });
      if (active(requestKey)) await refresh();
      return true;
    } catch (e) {
      if (active(requestKey)) setError((e as Error).message);
      return false;
    } finally {
      if (active(requestKey)) setBusy(false);
    }
  };
  const sendMessage = async (text: string) => {
    text = text.trim();
    if (!text || text.length > 2000 || !selectedConversation?.writable)
      return false;
    if (
      pendingMessage.current?.key !== key ||
      pendingMessage.current.text !== text
    )
      pendingMessage.current = { key, text, id: crypto.randomUUID() };
    const ok = await perform(SEND_CONVERSATION_MESSAGE, {
      conversationId,
      text,
      clientMessageId: pendingMessage.current.id,
    });
    if (ok) pendingMessage.current = null;
    return ok;
  };
  const loadOlder = async () => {
    if (!cursor || !conversationId) return;
    const requestKey = key;
    try {
      const result = await client.query<{
        getConversationMessages: {
          list: ChatMessage[];
          nextCursor: string | null;
        };
      }>({
        query: GET_CONVERSATION_MESSAGES,
        variables: { conversationId, before: cursor },
        fetchPolicy: 'no-cache',
      });
      if (!active(requestKey)) return;
      setMessages((prev) =>
        mergeMessages(prev, result.data?.getConversationMessages.list ?? []),
      );
      setCursor(result.data?.getConversationMessages.nextCursor ?? null);
    } catch (e) {
      if (active(requestKey)) setError((e as Error).message);
    }
  };
  return {
    userId,
    conversations: inboxOwner === userId ? conversations : [],
    total,
    selectedConversation: dataKey === key ? selectedConversation : null,
    messages: dataKey === key ? messages : [],
    offers: dataKey === key ? offers : [],
    hasOlder: dataKey === key && !!cursor,
    loading,
    busy,
    error,
    refresh,
    sendMessage,
    loadOlder,
    loadMoreConversations: () => {
      inboxPages.current += 1;
      void refresh();
    },
    sendOffer: (startDate: string, endDate: string) =>
      perform(SEND_POLICY_OFFER, { conversationId, startDate, endDate }),
    offerAction: (policyId: string, action: OfferAction) =>
      perform(
        {
          accept: ACCEPT_POLICY_OFFER,
          decline: DECLINE_POLICY_OFFER,
          withdraw: WITHDRAW_POLICY_OFFER,
          confirm: CONFIRM_POLICY_PAYMENT,
        }[action],
        { policyId },
      ),
  };
}
