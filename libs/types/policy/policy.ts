export interface Policy {
  _id: string;
  policyStatus?: string | null;
  memberId?: string | null;
  packageId?: string | null;
  memberNick?: string | null;
  packageName?: string | null;
  premiumAmount?: number | null;
  AgentId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  cancelledAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
