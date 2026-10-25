import { useState } from 'react';
import { useTranslation } from 'next-i18next/pages';
import { toLocalDateInput } from './helpers';
import type { Conversation } from './types';
export default function OfferForm({
  conversation,
  busy,
  onSend,
}: {
  conversation: Conversation;
  busy: boolean;
  onSend: (start: string, end: string) => Promise<boolean>;
}) {
  const { t } = useTranslation('common');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = new Date(tomorrow);
  year.setFullYear(year.getFullYear() + 1);
  const [open, setOpen] = useState(false),
    [start, setStart] = useState(toLocalDateInput(tomorrow)),
    [end, setEnd] = useState(toLocalDateInput(year));
  if (!open)
    return (
      <button
        className="messages-send-offer"
        disabled={busy || !conversation.writable}
        onClick={() => setOpen(true)}
      >
        {t('Send Offer')}
      </button>
    );
  return (
    <form
      className="messages-offer-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const a = new Date(`${start}T00:00:00`),
          b = new Date(`${end}T00:00:00`);
        if (b <= a || a.getTime() < Date.now()) return;
        if (await onSend(a.toISOString(), b.toISOString())) setOpen(false);
      }}
    >
      <h3>{t('Send an insurance offer')}</h3>
      <p>
        {conversation.packageName} · $
        {conversation.packagePrice?.toLocaleString()} {t('/mo')}
      </p>
      <p>
        {t('Coverage Limit')}:{' '}
        {conversation.coverageLimit == null
          ? t('Not specified')
          : `$${conversation.coverageLimit.toLocaleString()}`}
      </p>
      <div className="messages-date-fields">
        <label>
          {t('Coverage starts')}
          <input
            type="date"
            value={start}
            min={toLocalDateInput(tomorrow)}
            required
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          {t('Coverage ends')}
          <input
            type="date"
            value={end}
            min={start}
            required
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
      </div>
      <p className="messages-muted">
        {t(
          'The package price and coverage are included in the offer. Clients pay you directly.',
        )}
      </p>
      <div className="messages-offer-actions">
        <button type="submit" disabled={busy || end <= start}>
          {busy ? t('Sending...') : t('Send Offer')}
        </button>
        <button
          className="secondary"
          type="button"
          onClick={() => setOpen(false)}
        >
          {t('Cancel')}
        </button>
      </div>
    </form>
  );
}
