import { useState, useMemo, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client/react';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import withLayoutMain from '@/layout/LayoutHome';
import { userVar } from '@/apollo/store';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { GET_PACKAGE, GET_PACKAGES } from '@/apollo/user/query';
import { GET_COMMENTS } from '@/apollo/comment/query';
import { LIKE_TARGET_PACKAGE } from '@/apollo/package/mutation';
import { sweetMixinErrorAlert } from '@/libs/sweetAlert';
import { formatCount } from '@/libs/utils/format';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import {
  PackageDetailSkeleton,
  PackageDetailError,
  PackageSpecs,
  PackageComments,
  PackagePricingCard,
  PackageAgentCard,
  RelatedPackages,
  getPackageImage,
  typeLabel,
} from '@/libs/components/packages';
import MobilePackageDetailPage from '@/libs/components/mobile/packages/MobilePackageDetailPage';
import type {
  PackageDetail,
  Comment,
  RelatedPackage,
} from '@/libs/components/packages';

export const getServerSideProps = async ({
  locale = 'en',
}: {
  locale?: string;
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const PackageDetailPage: NextPage = () => {
  const router = useRouter();
  const device = useDeviceDetect();
  const packageId = typeof router.query.id === 'string' ? router.query.id : '';
  const pendingLikeRef = useRef(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);

  const commentsQueryVariables = useMemo(
    () => ({
      input: { page: 1, limit: 10, search: { commentRefId: packageId } },
    }),
    [packageId],
  );

  const relatedPackagesQueryVariables = useMemo(
    () => ({
      input: {
        page: 1,
        limit: 4,
        sort: 'packageViews',
        direction: 'DESC',
        search: {},
      },
    }),
    [],
  );

  const {
    data: packageData,
    loading: packageLoading,
    error: packageError,
  } = useQuery<{ getPackage: PackageDetail }>(GET_PACKAGE, {
    variables: { packageId },
    skip: !packageId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const pkg = packageData?.getPackage ?? null;

  const { data: commentsData } = useQuery<{
    getComments: { list: Comment[]; metaCounter: { total: number }[] };
  }>(GET_COMMENTS, {
    variables: commentsQueryVariables,
    skip: !packageId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (commentsData?.getComments) {
      setComments(commentsData.getComments.list || []);
      setCommentTotal(commentsData.getComments.metaCounter?.[0]?.total ?? 0);
    }
  }, [commentsData]);

  const { data: relatedData } = useQuery<{
    getPackages: { list: RelatedPackage[] };
  }>(GET_PACKAGES, {
    variables: relatedPackagesQueryVariables,
    skip: !pkg,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const related = useMemo(() => {
    if (!relatedData?.getPackages?.list || !pkg) return [];
    return relatedData.getPackages.list
      .filter((p) => p._id !== pkg._id)
      .slice(0, 3);
  }, [relatedData, pkg]);

  const [likePackage] = useMutation<{ likeTargetPackage: PackageDetail }>(
    LIKE_TARGET_PACKAGE
  );

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (pkg) {
      setLiked(pkg.meLiked?.[0]?.myFavorite ?? false);
      setLikeCount(pkg.packageLikes ?? 0);
    }
  }, [pkg]);

  const handleLike = async () => {
    if (pendingLikeRef.current) return;

    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert('Please login to like packages.');
      return;
    }

    const previousLiked = liked;
    const previousLikeCount = likeCount;
    const nextLiked = !previousLiked;

    pendingLikeRef.current = true;
    setLiked(nextLiked);
    setLikeCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    try {
      const res = await likePackage({ variables: { packageId } });
      const updated = res.data?.likeTargetPackage;
      if (updated) {
        setLiked(updated.meLiked?.[0]?.myFavorite ?? false);
        setLikeCount(updated.packageLikes ?? 0);
      }
    } catch (err: any) {
      setLiked(previousLiked);
      setLikeCount(previousLikeCount);
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message ?? 'Error updating like.'
      );
    } finally {
      pendingLikeRef.current = false;
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
    setCommentTotal((t) => t + 1);
  };

  if (packageLoading) return <PackageDetailSkeleton />;

  if (packageError) {
    const gqlError = packageError as any;
    const msg = gqlError?.graphQLErrors?.[0]?.message ?? '';
    return (
      <PackageDetailError
        message={
          msg === 'No data found!'
            ? 'Insurance not found.'
            : 'Failed to load. Please try again.'
        }
        onBack={() => router.back()}
      />
    );
  }

  if (!pkg) return null;

  if (device === 'mobile') {
    return (
      <MobilePackageDetailPage
        packageId={packageId}
        pkg={pkg}
        comments={comments}
        commentTotal={commentTotal}
        related={related}
        liked={liked}
        likeCount={likeCount}
        onBack={() => router.push('/packages')}
        onLike={handleLike}
        onCommentAdded={handleCommentAdded}
      />
    );
  }

  return (
    <Box className={'pd-page'}>
      <Box className={'pd-container'}>
        <Box className={'pd-main'}>
          <Box className={'pd-header'}>
            <Box className={'pd-badges'}>
              <span className={'pd-type-badge'}>
                {typeLabel(pkg.packageType)}
              </span>
              {pkg.packageStatus === 'ACTIVE' && (
                <span className={'pd-status-active'}>
                  <CheckCircleOutlinedIcon /> Active
                </span>
              )}
            </Box>
            <h1 className={'pd-title'}>{pkg.packageTitle}</h1>
          </Box>

          <Box className={'pd-hero-img'}>
            <Box
              className={'pd-hero-bg'}
              style={{
                backgroundImage: `url(${getPackageImage(pkg.packageImages)})`,
              }}
            />
            <Box className={'pd-hero-overlay'} />
          </Box>

          <Box className={'pd-stats'}>
            <span className={'pd-stat'}>
              <VisibilityOutlinedIcon />
              {formatCount(pkg.packageViews)} Views
            </span>
            <button
              className={`pd-stat pd-like${liked ? ' liked' : ''}`}
              onClick={handleLike}
            >
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              {formatCount(likeCount)} Likes
            </button>
            <span className={'pd-stat'}>
              <ChatBubbleOutlinedIcon />
              {formatCount(commentTotal)} Comments
            </span>
          </Box>

          {pkg.packageDesc && (
            <Box component={'section'}>
              <h2 className={'pd-section-title'}>Package Overview</h2>
              <p className={'pd-overview-text'}>{pkg.packageDesc}</p>
            </Box>
          )}

          <PackageSpecs
            coverageLimit={pkg.packageCoverageLimit}
            minAge={pkg.packageMinAge}
            maxAge={pkg.packageMaxAge}
            assetTags={pkg.packageAssetTags}
          />

          <PackageComments
            packageId={packageId}
            comments={comments}
            commentTotal={commentTotal}
            onCommentAdded={handleCommentAdded}
          />
        </Box>

        <Box component={'aside'} className={'pd-sidebar'}>
          <PackagePricingCard
            packageId={packageId}
            price={pkg.packagePrice}
            status={pkg.packageStatus}
          />
          {pkg.memberData && <PackageAgentCard agent={pkg.memberData} />}
        </Box>
      </Box>

      <RelatedPackages packages={related} />
    </Box>
  );
};

export default withLayoutMain(PackageDetailPage);
