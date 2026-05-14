import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Box, Stack } from '@mui/material';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import withLayoutMain from '@/layout/LayoutHome';
import { userVar } from '@/apollo/store';
import { GET_AGENT_PUBLIC_PACKAGES, GET_MEMBER } from '@/apollo/user/query';
import { LIKE_TARGET_PACKAGE } from '@/apollo/package/mutation';
import { GET_COMMENTS } from '@/apollo/comment/query';
import { CREATE_COMMENT } from '@/apollo/comment/mutation';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
import { toAssetUrl } from '@/libs/api';

const LISTING_LIMIT = 6;
const REVIEW_LIMIT = 5;

interface AgentDetail {
  _id: string;
  memberType?: string | null;
  memberStatus?: string | null;
  memberPhone?: string | null;
  memberNick?: string | null;
  memberFullName?: string | null;
  memberImage?: string | null;
  memberDesc?: string | null;
  memberProperties?: number | null;
  memberRank?: number | null;
  memberLikes?: number | null;
  memberViews?: number | null;
  memberComments?: number | null;
}

interface AgentPackage {
  _id: string;
  packageType: string;
  packageStatus: string;
  packageTitle: string;
  packagePrice: number;
  packageImages?: string[] | null;
  packageViews?: number | null;
  packageLikes?: number | null;
  packageComments?: number | null;
  packageRank?: number | null;
  packageCoverageLimit?: number | null;
  packageMinAge?: number | null;
  packageMaxAge?: number | null;
  meLiked?: { myFavorite: boolean }[] | null;
}

interface CommentMember {
  _id: string;
  memberNick?: string | null;
  memberImage?: string | null;
}

interface ReviewComment {
  _id: string;
  commentContent: string;
  createdAt: string;
  memberData?: CommentMember | null;
}

const formatCount = (value?: number | null) =>
  value == null ? '0' : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

const displayName = (agent?: AgentDetail | null) =>
  agent?.memberNick || agent?.memberFullName || 'Insurance Agent';

const getAsset = (path?: string | null) => toAssetUrl(path) ?? '/img/placeholder-article.svg';

const getPackageImage = (images?: string[] | null) =>
  toAssetUrl(images?.[0]) ?? '/img/placeholder-article.svg';

const typeLabel = (value: string) =>
  ({ AUTO: 'Auto', HOME: 'Home', HEALTH: 'Health', TRAVEL: 'Travel' })[value] ?? value;

const readableStatus = (status?: string | null) =>
  status ? status.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()) : 'Active';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
  });

const buildPageNumbers = (page: number, totalPages: number): Array<number | '...'> => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages: Array<number | '...'> = [1];
  if (page > 3) pages.push('...');

  for (
    let currentPage = Math.max(2, page - 1);
    currentPage <= Math.min(totalPages - 1, page + 1);
    currentPage += 1
  ) {
    pages.push(currentPage);
  }

  if (page < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
};

const AgentDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const agentId = typeof id === 'string' ? id : '';

  const [listingPage, setListingPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [packageLikes, setPackageLikes] = useState<Record<string, number>>({});
  const [packageLiked, setPackageLiked] = useState<Record<string, boolean>>({});

  const { loading: agentLoading, data: agentData } = useQuery<{ getMember: AgentDetail }>(
    GET_MEMBER,
    {
      skip: !agentId,
      fetchPolicy: 'no-cache',
      variables: { memberId: agentId },
    },
  );

  const {
    loading: listingsLoading,
    data: listingsData,
    refetch: refetchListings,
  } = useQuery<{
    getPackages: { list: AgentPackage[]; metaCounter: { total: number }[] };
  }>(GET_AGENT_PUBLIC_PACKAGES, {
    skip: !agentId,
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        page: listingPage,
        limit: LISTING_LIMIT,
        sort: 'createdAt',
        direction: 'DESC',
        search: { memberId: agentId, packageStatus: 'ACTIVE' },
      },
    },
  });

  const {
    loading: reviewsLoading,
    data: reviewsData,
    refetch: refetchReviews,
  } = useQuery<{
    getComments: { list: ReviewComment[]; metaCounter: { total: number }[] };
  }>(GET_COMMENTS, {
    skip: !agentId,
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        page: reviewPage,
        limit: REVIEW_LIMIT,
        sort: 'createdAt',
        direction: 'ASC',
        search: { commentRefId: agentId },
      },
    },
  });

  const [likeTargetPackage] = useMutation<{ likeTargetPackage: AgentPackage }>(
    LIKE_TARGET_PACKAGE,
  );
  const [createComment] = useMutation<{ createComment: ReviewComment }>(CREATE_COMMENT);

  const agent = agentData?.getMember ?? null;
  const listings = listingsData?.getPackages.list ?? [];
  const listingTotal = listingsData?.getPackages.metaCounter?.[0]?.total ?? 0;
  const listingTotalPages = Math.max(1, Math.ceil(listingTotal / LISTING_LIMIT));
  const reviews = reviewsData?.getComments.list ?? [];
  const reviewTotal = reviewsData?.getComments.metaCounter?.[0]?.total ?? 0;
  const reviewTotalPages = Math.max(1, Math.ceil(reviewTotal / REVIEW_LIMIT));

  useEffect(() => {
    if (!listings.length) return;

    setPackageLiked((prev) => {
      const next = { ...prev };
      listings.forEach((pkg) => {
        next[pkg._id] = pkg.meLiked?.[0]?.myFavorite ?? false;
      });
      return next;
    });
  }, [listings]);

  const handleLikePackage = async (event: MouseEvent, packageId: string) => {
    event.stopPropagation();

    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert('Please login to like packages.');
      return;
    }

    const pkg = listings.find((item) => item._id === packageId);
    const currentLiked = packageLiked[packageId] ?? pkg?.meLiked?.[0]?.myFavorite ?? false;
    const currentLikes = packageLikes[packageId] ?? pkg?.packageLikes ?? 0;

    setPackageLiked((prev) => ({ ...prev, [packageId]: !currentLiked }));
    setPackageLikes((prev) => ({
      ...prev,
      [packageId]: Math.max(0, currentLikes + (!currentLiked ? 1 : -1)),
    }));

    try {
      const result = await likeTargetPackage({ variables: { packageId } });
      const updated = result.data?.likeTargetPackage;
      if (updated) {
        setPackageLiked((prev) => ({
          ...prev,
          [packageId]: updated.meLiked?.[0]?.myFavorite ?? !currentLiked,
        }));
        setPackageLikes((prev) => ({
          ...prev,
          [packageId]: updated.packageLikes ?? currentLikes,
        }));
      }
      await refetchListings();
    } catch (err: any) {
      setPackageLiked((prev) => ({ ...prev, [packageId]: currentLiked }));
      setPackageLikes((prev) => ({ ...prev, [packageId]: currentLikes }));
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ??
          err?.message ??
          'Could not update package like.',
      );
    }
  };

  const handlePostReview = async () => {
    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert('Please login to submit a review.');
      return;
    }
    if (user._id === agentId) {
      await sweetMixinErrorAlert('You cannot write a review for yourself.');
      return;
    }
    if (!reviewText.trim()) return;

    try {
      await createComment({
        variables: {
          input: {
            commentGroup: 'MEMBER',
            commentContent: reviewText.trim(),
            commentRefId: agentId,
          },
        },
      });
      setReviewText('');
      setReviewPage(1);
      await refetchReviews({
        input: {
          page: 1,
          limit: REVIEW_LIMIT,
          sort: 'createdAt',
          direction: 'ASC',
          search: { commentRefId: agentId },
        },
      });
      await sweetTopSuccessAlert('Review submitted!');
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ??
          err?.message ??
          'Could not submit your review.',
      );
    }
  };

  if (agentLoading) {
    return (
      <Stack className='agent-detail-page'>
        <Stack className='agent-detail-shell'>
          <Stack className='agent-detail-profile skeleton'>
            <Box className='agent-detail-photo skeleton-block' />
            <Stack className='agent-detail-profile-info'>
              <Box className='skeleton-line wide' />
              <Box className='skeleton-line medium' />
              <Box className='skeleton-line short' />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }

  if (!agent) {
    return (
      <Stack className='agent-detail-page'>
        <Stack className='agent-detail-empty'>
          <BadgeOutlinedIcon />
          <h1>Agent not found</h1>
          <button onClick={() => router.push('/agents')}>Back to Agents</button>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack className='agent-detail-page'>
      <Stack className='agent-detail-shell'>
        <Stack className='agent-detail-profile'>
          <Box
            component='img'
            src={getAsset(agent.memberImage)}
            alt={displayName(agent)}
            className='agent-detail-photo'
          />
          <Stack className='agent-detail-profile-info'>
            <h1>{displayName(agent)}</h1>
            <Stack className='agent-detail-phone'>
              <PhoneOutlinedIcon />
              <span>{agent.memberPhone || 'Contact unavailable'}</span>
            </Stack>
            <Stack className='agent-detail-chips'>
              <span>{readableStatus(agent.memberStatus)}</span>
              <span>{agent.memberType || 'Agent'}</span>
              {agent.memberRank != null && <span>Rank #{agent.memberRank}</span>}
            </Stack>
            {agent.memberDesc && <p>{agent.memberDesc}</p>}
          </Stack>
          <Stack className='agent-detail-stats'>
            <Stack>
              <VisibilityOutlinedIcon />
              <strong>{formatCount(agent.memberViews)}</strong>
              <span>Views</span>
            </Stack>
            <Stack>
              <FavoriteIcon />
              <strong>{formatCount(agent.memberLikes)}</strong>
              <span>Likes</span>
            </Stack>
            <Stack>
              <ChatBubbleIcon />
              <strong>{formatCount(agent.memberComments)}</strong>
              <span>Reviews</span>
            </Stack>
          </Stack>
        </Stack>

        <Stack className='agent-detail-section'>
          <Stack className='agent-detail-section-head'>
            <h2>Active Listings ({listingTotal})</h2>
          </Stack>

          {listingsLoading ? (
            <Box className='agent-listing-grid'>
              {Array.from({ length: 3 }).map((_, index) => (
                <Stack key={index} className='agent-listing-card skeleton'>
                  <Box className='agent-listing-image skeleton-block' />
                  <Stack className='agent-listing-body'>
                    <Box className='skeleton-line wide' />
                    <Box className='skeleton-line medium' />
                  </Stack>
                </Stack>
              ))}
            </Box>
          ) : listings.length === 0 ? (
            <Stack className='agent-detail-panel-empty'>No active listings found.</Stack>
          ) : (
            <Box className='agent-listing-grid'>
              {listings.map((pkg) => {
                const liked = packageLiked[pkg._id] ?? pkg.meLiked?.[0]?.myFavorite ?? false;
                const likes = packageLikes[pkg._id] ?? pkg.packageLikes;

                return (
                  <Stack
                    key={pkg._id}
                    className='agent-listing-card'
                    onClick={() => router.push(`/packages/${pkg._id}`)}
                  >
                    <Box className='agent-listing-image-wrap'>
                      <Box
                        component='img'
                        src={getPackageImage(pkg.packageImages)}
                        alt={pkg.packageTitle}
                        className='agent-listing-image'
                      />
                      {pkg.packageRank != null && pkg.packageRank <= 3 && (
                        <span className='agent-listing-top'>TOP</span>
                      )}
                      <span className='agent-listing-price'>
                        ${pkg.packagePrice.toLocaleString()}
                      </span>
                    </Box>
                    <Stack className='agent-listing-body'>
                      <h3>{pkg.packageTitle}</h3>
                      <p>{typeLabel(pkg.packageType)} Coverage</p>
                      <Stack className='agent-listing-meta'>
                        {pkg.packageMinAge != null && (
                          <span>Ages {pkg.packageMinAge}-{pkg.packageMaxAge ?? '∞'}</span>
                        )}
                        {pkg.packageCoverageLimit != null && (
                          <span>${pkg.packageCoverageLimit.toLocaleString()} limit</span>
                        )}
                      </Stack>
                      <Stack className='agent-listing-stats'>
                        <Stack>
                          <VisibilityOutlinedIcon />
                          <span>{formatCount(pkg.packageViews)}</span>
                        </Stack>
                        <button
                          type='button'
                          className={liked ? 'liked' : ''}
                          onClick={(event) => handleLikePackage(event, pkg._id)}
                        >
                          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          <span>{formatCount(likes)}</span>
                        </button>
                        <Stack>
                          <ChatBubbleIcon />
                          <span>{formatCount(pkg.packageComments)}</span>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                );
              })}
            </Box>
          )}

          {listingTotalPages > 1 && (
            <Stack className='agent-detail-pagination'>
              <button disabled={listingPage === 1} onClick={() => setListingPage((prev) => prev - 1)}>
                <ChevronLeftIcon />
              </button>
              {buildPageNumbers(listingPage, listingTotalPages).map((item, index) =>
                item === '...' ? (
                  <span key={`listing-dots-${index}`}>...</span>
                ) : (
                  <button
                    key={item}
                    className={listingPage === item ? 'active' : ''}
                    onClick={() => setListingPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                disabled={listingPage === listingTotalPages}
                onClick={() => setListingPage((prev) => prev + 1)}
              >
                <ChevronRightIcon />
              </button>
            </Stack>
          )}
          {listingTotal > 0 && <p className='agent-detail-total'>Total {listingTotal} packages available</p>}
        </Stack>

        <Stack className='agent-detail-reviews'>
          <Stack className='agent-detail-review-intro'>
            <h2>Reviews</h2>
            <p>We are glad to see your feedback again.</p>
          </Stack>

          <Stack className='agent-detail-review-list'>
            <Stack className='agent-detail-review-title'>
              <StarBorderOutlinedIcon />
              <span>
                {reviewTotal} review{reviewTotal !== 1 ? 's' : ''}
              </span>
            </Stack>

            {reviewsLoading ? (
              <Stack className='agent-detail-panel-empty'>Loading reviews...</Stack>
            ) : reviews.length === 0 ? (
              <Stack className='agent-detail-panel-empty'>No reviews yet.</Stack>
            ) : (
              reviews.map((review) => (
                <Stack key={review._id} className='agent-review-card'>
                  <Stack className='agent-review-author'>
                    <Box
                      component='img'
                      src={getAsset(review.memberData?.memberImage)}
                      alt={review.memberData?.memberNick ?? 'Member'}
                    />
                    <Stack>
                      <strong>{review.memberData?.memberNick ?? 'Member'}</strong>
                      <span>{formatDate(review.createdAt)}</span>
                    </Stack>
                  </Stack>
                  <p>{review.commentContent}</p>
                </Stack>
              ))
            )}

            {reviewTotalPages > 1 && (
              <Stack className='agent-detail-pagination'>
                <button disabled={reviewPage === 1} onClick={() => setReviewPage((prev) => prev - 1)}>
                  <ChevronLeftIcon />
                </button>
                {buildPageNumbers(reviewPage, reviewTotalPages).map((item, index) =>
                  item === '...' ? (
                    <span key={`review-dots-${index}`}>...</span>
                  ) : (
                    <button
                      key={item}
                      className={reviewPage === item ? 'active' : ''}
                      onClick={() => setReviewPage(item)}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  disabled={reviewPage === reviewTotalPages}
                  onClick={() => setReviewPage((prev) => prev + 1)}
                >
                  <ChevronRightIcon />
                </button>
              </Stack>
            )}
          </Stack>

          <Stack className='agent-detail-review-form'>
            <h3>Leave A Review</h3>
            <label htmlFor='agent-review'>Review</label>
            <textarea
              id='agent-review'
              value={reviewText}
              placeholder='Write your review here...'
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReviewText(event.target.value)}
            />
            <Stack className='agent-detail-review-actions'>
              <button disabled={!reviewText.trim()} onClick={handlePostReview}>
                <span>Submit Review</span>
                <OpenInNewOutlinedIcon />
              </button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default withLayoutMain(AgentDetailPage);
