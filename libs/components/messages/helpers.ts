import type { ChatMessage, OfferAction, PolicyOffer } from './types';
export function resolveOfferActions(
  stage: string | null | undefined,
  role: 'client' | 'agent',
  writable: boolean,
): OfferAction[] {
  if (!['OFFERED', 'AWAITING_PAYMENT'].includes(stage ?? '')) return [];
  if (role === 'client')
    return [
      ...(stage === 'OFFERED' && writable ? ['accept' as const] : []),
      'decline',
    ];
  return [
    ...(stage === 'AWAITING_PAYMENT' && writable ? ['confirm' as const] : []),
    'withdraw',
  ];
}
export function getPurchaseLabel(
  policy: Pick<PolicyOffer, 'policyStatus' | 'purchaseStage'>,
): string {
  if (policy.policyStatus === 'CANCELLED' || policy.policyStatus === 'EXPIRED')
    return policy.policyStatus;
  return (
    (
      {
        OFFERED: 'Offer received',
        AWAITING_PAYMENT: 'Awaiting Payment',
        DECLINED: 'Declined',
        WITHDRAWN: 'Withdrawn',
      } as Record<string, string>
    )[policy.purchaseStage ?? ''] ?? policy.policyStatus
  );
}
export function mergeMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  return Array.from(
    new Map([...existing, ...incoming].map((m) => [m._id, m])).values(),
  ).sort(
    (a, b) =>
      a.createdAt.localeCompare(b.createdAt) || a._id.localeCompare(b._id),
  );
}
export function toLocalDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export interface MessagePage {
  list: ChatMessage[];
  nextCursor: string | null;
}
export async function recoverMessageGap(
  first: MessagePage,
  knownLatestId: string,
  loadOlder: (cursor: string) => Promise<MessagePage>,
): Promise<MessagePage> {
  let page = first;
  let list = first.list;
  const seen = new Set<string>();
  while (
    knownLatestId &&
    !list.some((message) => message._id === knownLatestId) &&
    page.nextCursor
  ) {
    if (seen.has(page.nextCursor))
      throw new Error('Message history could not be refreshed');
    seen.add(page.nextCursor);
    page = await loadOlder(page.nextCursor);
    list = mergeMessages(page.list, list);
  }
  return { list, nextCursor: page.nextCursor };
}
