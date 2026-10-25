import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import ConversationList from './ConversationList';
import ConversationThread from './ConversationThread';
import { useMessages } from './useMessages';
export default function MessagesPanel({
  conversationId,
  packageId,
}: {
  conversationId?: string;
  packageId?: string;
}) {
  const router = useRouter(),
    { t } = useTranslation('common');
  const select = useCallback(
    (id: string) => {
      void router.replace(
        {
          pathname: '/mypage',
          query: { category: 'messages', conversationId: id },
        },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );
  const c = useMessages({ conversationId, packageId, onSelect: select });
  return (
    <div className="messages-panel-wrap">
      {c.error ? (
        <div className="messages-error" role="alert">
          {t(c.error)}{' '}
          <button onClick={() => void c.refresh()}>{t('Try again')}</button>
        </div>
      ) : null}
      <div
        className={`messages-panel ${conversationId ? 'has-selection' : ''}`}
      >
        <ConversationList
          conversations={c.conversations}
          userId={c.userId}
          selectedId={conversationId}
          onSelect={select}
          loading={c.loading}
          hasMore={c.total > c.conversations.length}
          onMore={c.loadMoreConversations}
        />
        <ConversationThread
          key={`${c.userId}:${conversationId ?? ''}`}
          controller={c}
          onBack={() =>
            void router.replace('/mypage?category=messages', undefined, {
              shallow: true,
            })
          }
        />
      </div>
    </div>
  );
}
