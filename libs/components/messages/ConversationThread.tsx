import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { toIntlLocale } from '@/libs/utils/locale';
import PolicyOfferCard from './PolicyOfferCard';
import OfferForm from './OfferForm';
import type { useMessages } from './useMessages';
type Controller = ReturnType<typeof useMessages>;
export default function ConversationThread({
  controller: c,
  onBack,
}: {
  controller: Controller;
  onBack: () => void;
}) {
  const { t } = useTranslation('common'),
    { locale } = useRouter();
  const [draft, setDraft] = useState(''),
    bottom = useRef<HTMLDivElement>(null),
    previousLatest = useRef('');
  const conversation = c.selectedConversation;
  useEffect(() => {
    const latest = c.messages.at(-1)?._id ?? '';
    if (latest !== previousLatest.current) {
      bottom.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      previousLatest.current = latest;
    }
  }, [c.messages]);
  if (!conversation)
    return (
      <section className="messages-thread messages-empty" role="status">
        {c.loading
          ? t('Loading conversation...')
          : t('Choose a conversation to get started.')}
        <button className="messages-link-button" onClick={onBack}>
          {t('Back to conversations')}
        </button>
      </section>
    );
  const role = conversation.agentId === c.userId ? 'agent' : 'client',
    other = role === 'client' ? conversation.agent : conversation.client;
  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft;
    if (await c.sendMessage(text))
      setDraft((value) => (value === text ? '' : value));
  };
  const hasOpenOffer = c.offers.some(
    (o) =>
      ['OFFERED', 'AWAITING_PAYMENT'].includes(o.purchaseStage ?? '') ||
      o.policyStatus === 'ACTIVE',
  );
  return (
    <section className="messages-thread" aria-label={t('Private conversation')}>
      <header className="messages-thread-header">
        <button
          className="messages-back"
          onClick={onBack}
          aria-label={t('Back to conversations')}
        >
          <ArrowBackIcon />
        </button>
        <div>
          <h2>{other?.memberNick ?? t('Insurance Agent')}</h2>
          <Link href={`/packages/${conversation.packageId}`}>
            {conversation.packageName}
          </Link>
        </div>
        <span className="messages-private-label">{t('Private')}</span>
      </header>
      {!conversation.writable ? (
        <p className="messages-readonly" role="status">
          {t(conversation.unavailableReason ?? 'Conversation unavailable')}
        </p>
      ) : null}
      <div
        className="messages-history"
        role="log"
        aria-label={t('Message history')}
        aria-live="polite"
      >
        {c.hasOlder ? (
          <button
            className="messages-link-button"
            onClick={() => void c.loadOlder()}
          >
            {t('Load earlier messages')}
          </button>
        ) : null}
        {!c.messages.length && !c.offers.length ? (
          <p className="messages-empty">
            {t(
              'Ask your agent about coverage, pricing, and how to pay directly.',
            )}
          </p>
        ) : null}
        {c.messages.map((message) => (
          <div
            className={`messages-bubble ${message.senderId === c.userId ? 'own' : ''}`}
            key={message._id}
          >
            <p>{message.text}</p>
            <time dateTime={message.createdAt}>
              {new Date(message.createdAt).toLocaleString(
                toIntlLocale(locale),
                {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                },
              )}
            </time>
          </div>
        ))}
        {c.offers
          .slice()
          .reverse()
          .map((offer) => (
            <PolicyOfferCard
              key={offer._id}
              offer={offer}
              clientName={conversation.client?.memberNick}
              role={role}
              writable={conversation.writable}
              busy={c.busy}
              onAction={c.offerAction}
            />
          ))}
        <div ref={bottom} />
      </div>
      {role === 'agent' && conversation.writable && !hasOpenOffer ? (
        <OfferForm
          conversation={conversation}
          busy={c.busy}
          onSend={c.sendOffer}
        />
      ) : null}
      <form className="messages-composer" onSubmit={send}>
        <label className="messages-sr-only" htmlFor="private-message">
          {t('Message')}
        </label>
        <textarea
          id="private-message"
          maxLength={2000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('Write a message...')}
          rows={2}
          disabled={!conversation.writable}
        />
        <button
          type="submit"
          disabled={c.busy || !conversation.writable || !draft.trim()}
          aria-label={t('Send message')}
        >
          <SendOutlinedIcon />
        </button>
      </form>
    </section>
  );
}
