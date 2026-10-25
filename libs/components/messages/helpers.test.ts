import {
  getPurchaseLabel,
  mergeMessages,
  resolveOfferActions,
} from './helpers';
describe('Agent purchase UI', () => {
  it('shows_only_authorized_offer_actions', () => {
    expect(resolveOfferActions('OFFERED', 'client', true)).toEqual([
      'accept',
      'decline',
    ]);
    expect(resolveOfferActions('OFFERED', 'agent', true)).toEqual(['withdraw']);
    expect(resolveOfferActions('AWAITING_PAYMENT', 'agent', true)).toEqual([
      'confirm',
      'withdraw',
    ]);
    expect(resolveOfferActions('AWAITING_PAYMENT', 'client', true)).toEqual([
      'decline',
    ]);
    expect(resolveOfferActions('CONFIRMED', 'client', true)).toEqual([]);
    expect(resolveOfferActions('OFFERED', 'agent', false)).toEqual([
      'withdraw',
    ]);
  });
  it('preserves_cancellation_and_pending_labels', () => {
    expect(
      getPurchaseLabel({
        policyStatus: 'PENDING',
        purchaseStage: 'AWAITING_PAYMENT',
      }),
    ).toBe('Awaiting Payment');
    expect(
      getPurchaseLabel({
        policyStatus: 'CANCELLED',
        purchaseStage: 'CONFIRMED',
      }),
    ).toBe('CANCELLED');
    expect(getPurchaseLabel({ policyStatus: 'ACTIVE' })).toBe('ACTIVE');
  });
  it('merges_history_and_live_updates_without_duplicates', () => {
    const a: any = { _id: 'a', createdAt: '2026-01-01' },
      b: any = { _id: 'b', createdAt: '2026-01-01' };
    expect(mergeMessages([b, a], [a]).map((x) => x._id)).toEqual(['a', 'b']);
  });
});
describe('Reconnect history recovery', () => {
  it('fills_all_missed_pages_before_marking_latest_messages_read', async () => {
    const { recoverMessageGap } = await import('./helpers');
    const make = (n: number): any => ({
      _id: String(n).padStart(3, '0'),
      createdAt: new Date(n * 1000).toISOString(),
      text: String(n),
    });
    const load = jest
      .fn()
      .mockResolvedValueOnce({
        list: Array.from({ length: 30 }, (_, i) => make(i + 31)),
        nextCursor: 'page-3',
      })
      .mockResolvedValueOnce({
        list: Array.from({ length: 30 }, (_, i) => make(i + 1)),
        nextCursor: 'older',
      });
    const first = {
      list: Array.from({ length: 30 }, (_, i) => make(i + 61)),
      nextCursor: 'page-2',
    };
    const result = await recoverMessageGap(first, '025', load);
    expect(result.list.map((m) => m._id)).toEqual(
      Array.from({ length: 90 }, (_, i) => String(i + 1).padStart(3, '0')),
    );
    expect(load).toHaveBeenCalledTimes(2);
    expect(result.nextCursor).toBe('older');
  });
});
