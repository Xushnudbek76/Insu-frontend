export type PurchaseStage =
  | 'OFFERED'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'WITHDRAWN';
export type OfferAction = 'accept' | 'decline' | 'withdraw' | 'confirm';
export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  clientMessageId: string;
  text: string;
  createdAt: string;
}
export interface ChatMember {
  _id: string;
  memberNick: string;
  memberImage?: string | null;
}
export interface Conversation {
  _id: string;
  clientId: string;
  agentId: string;
  packageId: string;
  packageName: string;
  packagePrice?: number | null;
  coverageLimit?: number | null;
  client?: ChatMember | null;
  agent?: ChatMember | null;
  lastMessage?: ChatMessage | null;
  unreadCount: number;
  writable: boolean;
  unavailableReason?: string | null;
}
export interface PolicyOffer {
  _id: string;
  conversationId?: string | null;
  packageName: string;
  premiumAmount: number;
  coverageLimit?: number | null;
  startDate: string;
  endDate: string;
  policyStatus: string;
  purchaseStage?: PurchaseStage | null;
  offeredAt?: string | null;
  acceptedAt?: string | null;
  paymentConfirmedAt?: string | null;
}
