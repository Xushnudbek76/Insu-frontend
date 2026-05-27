export interface Faq {
  _id: string;
  faqCategory?: string | null;
  faqStatus?: string | null;
  faqQuestion?: string | null;
  faqAnswer?: string | null;
  faqOrder?: number | null;
  memberId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
