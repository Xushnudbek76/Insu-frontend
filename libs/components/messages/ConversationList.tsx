import { Avatar } from '@mui/material';
import { useTranslation } from 'next-i18next/pages';
import { toAssetUrl } from '@/libs/api';
import type { Conversation } from './types';
export default function ConversationList({
  conversations,
  userId,
  selectedId,
  onSelect,
  loading,
  hasMore,
  onMore,
}: {
  conversations: Conversation[];
  userId: string;
  selectedId?: string;
  onSelect: (id: string) => void;
  loading: boolean;
  hasMore: boolean;
  onMore: () => void;
}) {
  const { t } = useTranslation('common');
  return (
    <aside className="messages-inbox" aria-label={t('Conversations')}>
      <div className="messages-inbox-heading">
        <h2>{t('Messages')}</h2>
        <span>{t('Your insurance conversations')}</span>
      </div>
      {loading && !conversations.length ? (
        <p className="messages-empty" role="status">
          {t('Loading conversations...')}
        </p>
      ) : null}
      {!loading && !conversations.length ? (
        <div className="messages-empty">
          <h3>{t('No conversations yet')}</h3>
          <p>
            {t(
              'Open an insurance package and choose Chat with Agent to get started.',
            )}
          </p>
        </div>
      ) : null}
      <div className="messages-conversations">
        {conversations.map((c) => {
          const other = c.clientId === userId ? c.agent : c.client;
          return (
            <button
              key={c._id}
              className={`messages-conversation ${selectedId === c._id ? 'selected' : ''}`}
              onClick={() => onSelect(c._id)}
              aria-current={selectedId === c._id ? 'true' : undefined}
            >
              <Avatar src={toAssetUrl(other?.memberImage) ?? undefined} alt="">
                {other?.memberNick?.slice(0, 1)}
              </Avatar>
              <span className="messages-conversation-text">
                <strong>{other?.memberNick ?? t('Insurance Agent')}</strong>
                <span>{c.packageName}</span>
                <small>
                  {c.lastMessage?.text ?? t('Start a conversation')}
                </small>
              </span>
              {c.unreadCount > 0 ? (
                <span
                  className="messages-unread"
                  aria-label={t('Unread messages')}
                >
                  {c.unreadCount > 99 ? '99+' : c.unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {hasMore ? (
        <button className="messages-link-button" onClick={onMore}>
          {t('Load more conversations')}
        </button>
      ) : null}
    </aside>
  );
}
