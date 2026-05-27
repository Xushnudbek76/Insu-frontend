export interface Claim {
  _id: string;
  claimStatus?: string | null;
  memberId?: string | null;
  policyId?: string | null;
  claimTitle?: string | null;
  claimDesc?: string | null;
  agentId?: string | null;
  claimAmount?: number | null;
  claimDocuments?: string[] | null;
  aiAnalysis?: string | null;
  agentNote?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
