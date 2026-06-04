import { toAssetUrl } from '@/libs/api';
import { toIntlLocale } from '@/libs/utils/locale';

export const POLICY_LIMIT = 5;
export const AGENT_CLAIM_LIMIT = 5;
export const FAVORITE_LIMIT = 6;
export const AGENT_PACKAGE_LIMIT = 6;

export type Category = 'myProfile' | 'myPackages' | 'addPackage' | 'myPolicies' | 'myClaims' | 'myFavorites' | 'agentClaims';
export type PackageType =
  | 'TERM_LIFE'
  | 'WHOLE_LIFE'
  | 'PET'
  | 'CRITICAL_ILLNESS'
  | 'DISABILITY'
  | 'TRAVEL'
  | 'CYBER_LIABILITY'
  | 'PROFESSIONAL_INDEMNITY'
  | 'LEGAL_EXPENSE'
  | 'ACCIDENT'
  | 'HEALTH'
  | 'AUTO'
  | 'HOME';
export type PolicyStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SETTLED';

export interface PolicyData {
  _id: string;
  policyStatus: PolicyStatus;
  packageId: string;
  packageName: string;
  premiumAmount: number;
  AgentId: string;
  startDate: string;
  endDate: string;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimData {
  _id: string;
  claimStatus: ClaimStatus;
  memberId: string;
  policyId: string;
  claimTitle: string;
  claimDesc: string;
  agentId: string;
  claimAmount: number;
  claimDocuments?: string[] | null;
  aiAnalysis?: string | null;
  agentNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FavoritePackage {
  _id: string;
  packageType: string;
  packageStatus: string;
  packageTitle: string;
  packagePrice: number;
  packageImages?: string[] | null;
  packageViews?: number | null;
  packageLikes?: number | null;
  packageComments?: number | null;
  packageCoverageLimit?: number | null;
  memberData?: { _id: string; memberNick?: string | null; memberImage?: string | null } | null;
}

export interface AgentOwnedPackage {
  _id: string;
  packageType: string;
  packageStatus: string;
  packageTitle: string;
  packageDesc?: string | null;
  packagePrice: number;
  packageCoverageLimit?: number | null;
  packageMinAge?: number | null;
  packageMaxAge?: number | null;
  packageAssetTags?: string[] | null;
  packageImages?: string[] | null;
  packageViews?: number | null;
  packageLikes?: number | null;
  packageComments?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProfileForm {
  memberNick: string;
  memberFullName: string;
  memberPhone: string;
  memberAddress: string;
  memberDesc: string;
  memberImage: string;
}

export interface ClaimForm {
  policyId: string;
  claimTitle: string;
  claimDesc: string;
  claimAmount: string;
  claimDocuments: string;
}

export interface PackageForm {
  _id?: string;
  packageType: PackageType | '';
  packageName: string;
  packageDesc: string;
  packagePrice: string;
  packageCoverageLimit: string;
  packageMinAge: string;
  packageMaxAge: string;
  packageAssetTags: string;
  packageImages: string[];
}

export const initialClaimForm: ClaimForm = {
  policyId: '',
  claimTitle: '',
  claimDesc: '',
  claimAmount: '',
  claimDocuments: '',
};

export const initialPackageForm: PackageForm = {
  _id: '',
  packageType: '',
  packageName: '',
  packageDesc: '',
  packagePrice: '',
  packageCoverageLimit: '',
  packageMinAge: '',
  packageMaxAge: '',
  packageAssetTags: '',
  packageImages: [],
};

export const packageTypes: PackageType[] = [
  'AUTO',
  'HOME',
  'HEALTH',
  'TRAVEL',
  'TERM_LIFE',
  'WHOLE_LIFE',
  'PET',
  'CRITICAL_ILLNESS',
  'DISABILITY',
  'CYBER_LIABILITY',
  'PROFESSIONAL_INDEMNITY',
  'LEGAL_EXPENSE',
  'ACCIDENT',
];

export const isCategory = (value: unknown): value is Category =>
  ['myProfile', 'myPackages', 'addPackage', 'myPolicies', 'myClaims', 'myFavorites', 'agentClaims'].includes(`${value}`);

export const formatCurrency = (value?: number | null) =>
  value == null
    ? '$0'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);

export const formatDate = (value?: string | null, locale?: string) =>
  value ? new Date(value).toLocaleDateString(toIntlLocale(locale), { month: 'short', day: '2-digit', year: 'numeric' }) : '-';

export const avatarUrl = (image?: string | null) => toAssetUrl(image) ?? '/img/profile/defaultUser.svg';
export const packageImageUrl = (image?: string | null) => toAssetUrl(image) ?? '/img/placeholder-article.svg';
