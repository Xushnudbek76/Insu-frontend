import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { getPurchaseLabel, resolveOfferActions } from './helpers';
import type { PolicyOffer, OfferAction } from './types';
import { toIntlLocale } from '@/libs/utils/locale';
export default function PolicyOfferCard({
  offer,
  role,
  writable,
  busy,
  onAction,
  clientName,
}: {
  offer: PolicyOffer;
  role: 'client' | 'agent';
  writable: boolean;
  busy: boolean;
  onAction: (id: string, action: OfferAction) => Promise<boolean>;
  clientName?: string;
}) {
  const { t } = useTranslation('common'),
    { locale } = useRouter();
  const date = (value: string) =>
    new Date(value).toLocaleDateString(toIntlLocale(locale), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  const actionLabel: Record<OfferAction, string> = {
    accept: 'Accept Offer',
    decline: 'Decline',
    withdraw: 'Withdraw Offer',
    confirm: 'Confirm Payment Received',
  };
  const act = (action: OfferAction) => {
    if (
      action === 'confirm' &&
      !window.confirm(
        `${t('Confirm Payment Received')}\n${clientName ?? ''} · ${offer.packageName} · $${offer.premiumAmount.toLocaleString()} ${t('/mo')}\n${t('Confirm that you received the client’s payment directly.')}`,
      )
    )
      return;
    void onAction(offer._id, action);
  };
  return (
    <section
      className={`messages-offer ${offer.purchaseStage?.toLowerCase() ?? ''}`}
      aria-label={t('Insurance offer')}
    >
      <div className="messages-offer-top">
        <span>{t('Insurance offer')}</span>
        <span className="messages-status">{t(getPurchaseLabel(offer))}</span>
      </div>
      <h3>{offer.packageName}</h3>
      <div className="messages-offer-price">
        ${offer.premiumAmount.toLocaleString()} <small>{t('/mo')}</small>
      </div>
      <dl>
        <div>
          <dt>{t('Coverage Limit')}</dt>
          <dd>
            {offer.coverageLimit == null
              ? t('Not specified')
              : `$${offer.coverageLimit.toLocaleString()}`}
          </dd>
        </div>
        <div>
          <dt>{t('Coverage dates')}</dt>
          <dd>
            {date(offer.startDate)} – {date(offer.endDate)}
          </dd>
        </div>
      </dl>
      {offer.purchaseStage === 'AWAITING_PAYMENT' ? (
        <p className="messages-payment-note">
          {t(
            'Pay your agent directly. Your policy activates after the agent confirms payment.',
          )}
        </p>
      ) : null}
      <div className="messages-offer-actions">
        {resolveOfferActions(offer.purchaseStage, role, writable).map(
          (action) => (
            <button
              key={action}
              disabled={busy}
              className={
                action === 'decline' || action === 'withdraw' ? 'secondary' : ''
              }
              onClick={() => act(action)}
            >
              {t(actionLabel[action])}
            </button>
          ),
        )}
        {offer.purchaseStage === 'CONFIRMED' && role === 'client' ? (
          <Link href="/mypage?category=myPolicies">{t('View Policy')}</Link>
        ) : null}
      </div>
    </section>
  );
}
