export interface MemberData {
  _id: string;
  memberNick?: string | null;
  memberImage?: string | null;
}

export interface PackageDetail {
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
  memberData?: MemberData | null;
  meLiked?: { myFavorite: boolean }[] | null;
}

export interface Comment {
  _id: string;
  commentContent: string;
  createdAt: string;
  memberData?: MemberData | null;
}

export interface RelatedPackage {
  _id: string;
  packageType: string;
  packageTitle: string;
  packagePrice: number;
  packageImages?: string[] | null;
}

export interface PurchasedPolicy {
  _id: string;
  policyStatus: string;
  packageId: string;
  packageName: string;
  premiumAmount: number;
  startDate: string;
  endDate: string;
}
