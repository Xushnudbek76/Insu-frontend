import { Box, Stack } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { useTranslation } from 'next-i18next/pages';
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
  <MobilePackageDetailContent
    packageId={packageId}
    pkg={pkg}
    comments={comments}
    commentTotal={commentTotal}
    related={related}
    liked={liked}
    likeCount={likeCount}
    onBack={onBack}
    onLike={onLike}
    onCommentAdded={onCommentAdded}
  />
);

const MobilePackageDetailContent = ({
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
}: MobilePackageDetailPageProps) => {
  const { t } = useTranslation('common');

  return (
    <Stack className='mobile-package-detail-page'>
      <button className='mobile-back-btn' onClick={onBack}>
        <ArrowBackOutlinedIcon />
        {t('Back to packages')}
      </button>

    <Box
      className='mobile-package-detail-hero'
      style={{ backgroundImage: `linear-gradient(rgba(8, 13, 20, 0.22), rgba(8, 13, 20, 0.55)), url(${getPackageImage(pkg.packageImages)})` }}
    >
      <span>{t(typeLabel(pkg.packageType))}</span>
      <h1>{pkg.packageTitle}</h1>
      <p>{pkg.packageDesc || t('Protection details and plan benefits are listed below.')}</p>
    </Box>

    <Stack className='mobile-package-detail-stats'>
      <span>
        <VisibilityOutlinedIcon />
        {formatCount(pkg.packageViews)} {t('views')}
      </span>
      <button className={liked ? 'liked' : ''} onClick={onLike}>
        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        {formatCount(likeCount)} {t('likes')}
      </button>
      <span>
        <ChatBubbleOutlinedIcon />
        {formatCount(commentTotal)} {t('comments')}
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
};

export default MobilePackageDetailPage;
