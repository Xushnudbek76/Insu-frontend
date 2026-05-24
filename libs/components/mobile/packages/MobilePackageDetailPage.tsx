import { Box, Stack } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import {
  PackageAgentCard,
  PackageComments,
  PackagePricingCard,
  PackageSpecs,
  RelatedPackages,
  getPackageImage,
  typeLabel,
} from '@/libs/components/packages';
import type { Comment, PackageDetail, RelatedPackage } from '@/libs/components/packages';
import { formatCount } from '@/libs/utils/format';

interface MobilePackageDetailPageProps {
  packageId: string;
  pkg: PackageDetail;
  comments: Comment[];
  commentTotal: number;
  related: RelatedPackage[];
  liked: boolean;
  likeCount: number;
  onBack: () => void;
  onLike: () => void;
  onCommentAdded: (newComment: Comment) => void;
}

const MobilePackageDetailPage = ({
  packageId,
  pkg,
  comments,
  commentTotal,
  related,
  liked,
  likeCount,
  onBack,
  onLike,
  onCommentAdded,
}: MobilePackageDetailPageProps) => (
  <Stack className='mobile-package-detail-page'>
    <button className='mobile-back-btn' onClick={onBack}>
      <ArrowBackOutlinedIcon />
      Back to packages
    </button>

    <Box
      className='mobile-package-detail-hero'
      style={{ backgroundImage: `linear-gradient(rgba(8, 13, 20, 0.22), rgba(8, 13, 20, 0.55)), url(${getPackageImage(pkg.packageImages)})` }}
    >
      <span>{typeLabel(pkg.packageType)}</span>
      <h1>{pkg.packageTitle}</h1>
      <p>{pkg.packageDesc || 'Protection details and plan benefits are listed below.'}</p>
    </Box>

    <Stack className='mobile-package-detail-stats'>
      <span>
        <VisibilityOutlinedIcon />
        {formatCount(pkg.packageViews)} views
      </span>
      <button className={liked ? 'liked' : ''} onClick={onLike}>
        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        {formatCount(likeCount)} likes
      </button>
      <span>
        <ChatBubbleOutlinedIcon />
        {formatCount(commentTotal)} comments
      </span>
    </Stack>

    <Stack className='mobile-package-detail-stack'>
      <PackagePricingCard packageId={packageId} price={pkg.packagePrice} status={pkg.packageStatus} />
      {pkg.memberData && <PackageAgentCard agent={pkg.memberData} />}
      <PackageSpecs
        coverageLimit={pkg.packageCoverageLimit}
        minAge={pkg.packageMinAge}
        maxAge={pkg.packageMaxAge}
        assetTags={pkg.packageAssetTags}
      />
      <PackageComments packageId={packageId} comments={comments} commentTotal={commentTotal} onCommentAdded={onCommentAdded} />
    </Stack>

    <RelatedPackages packages={related} />
  </Stack>
);

export default MobilePackageDetailPage;
