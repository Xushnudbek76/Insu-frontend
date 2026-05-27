import type { MeLiked } from '@/libs/types/common';

export interface InsurancePackage {
  _id: string;
  packageType: string;
  packageStatus: string;
  packageTitle: string;
  packageAssetTags?: string[] | null;
  packagePrice: number;
  packageViews?: number | null;
  packageLikes?: number | null;
  packageRank?: number | null;
  packageDesc?: string | null;
  packageImages?: string[] | null;
  packageCoverageLimit?: number | null;
  packageMinAge?: number | null;
  packageMaxAge?: number | null;
  packageComments?: number | null;
  memberId?: string | null;
  meLiked?: MeLiked[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
