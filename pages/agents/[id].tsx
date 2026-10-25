import { ChangeEvent, MouseEvent, SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Box, Stack } from '@mui/material';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import withLayoutMain from '@/layout/LayoutHome';
import { userVar } from '@/apollo/store';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { getMeLiked, useLikeToggleMap } from '@/libs/hooks/useLikeToggle';
import type { LikeState } from '@/libs/types/common';
import {
  GET_AGENT_PUBLIC_PACKAGES,
  GET_MEMBER,
  GET_MEMBER_FOLLOWERS,
  GET_MEMBER_FOLLOWINGS,
} from '@/apollo/user/query';
import { LIKE_TARGET_PACKAGE } from '@/apollo/package/mutation';
import { SUBSCRIBE, UNSUBSCRIBE } from '@/apollo/member/mutation';
import { GET_COMMENTS } from '@/apollo/comment/query';
import { CREATE_COMMENT } from '@/apollo/comment/mutation';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
import { toAssetUrl } from '@/libs/api';
import { formatCount } from '@/libs/utils/format';
import { buildPageNumbers } from '@/libs/utils/pagination';
import MobileAgentDetailPage from '@/libs/components/mobile/agents/MobileAgentDetailPage';

const LISTING_LIMIT = 6;
const REVIEW_LIMIT = 5;
const NETWORK_LIMIT = 5;

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
  memberFollowers?: number | null;
  memberFollowings?: number | null;
  meFollowed?: { followingId?: string | null; followerId?: string | null; myFollowing: boolean }[] | null;
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

interface NetworkMember {
  _id: string;
  memberType?: string | null;
  memberNick?: string | null;
  memberFullName?: string | null;
  memberImage?: string | null;
  memberFollowers?: number | null;
  memberFollowings?: number | null;
  memberLikes?: number | null;
}

interface NetworkFollow {
  _id: string;
  followingId: string;
  followerId: string;
  meFollowed?: { followingId?: string | null; followerId?: string | null; myFollowing: boolean }[] | null;
  followerData?: NetworkMember | null;
  followingData?: NetworkMember | null;
}

type NetworkTab = 'followers' | 'followings';

const PLACEHOLDER_IMAGE = '/img/placeholder-article.svg';

const getPackageImage = (images?: string[] | null) => toAssetUrl(images?.[0]) ?? PLACEHOLDER_IMAGE;

const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';

const getAvatar = (path?: string | null) => toAssetUrl(path) ?? DEFAULT_AVATAR;

// Uploaded photos can go missing; show the default avatar instead of a broken image.
const handleAvatarError = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (!image.src.endsWith(DEFAULT_AVATAR)) image.src = DEFAULT_AVATAR;
};

const typeLabelKey = (value: string) =>
  ({ AUTO: 'Auto', HOME: 'Home Type', HEALTH: 'Health', TRAVEL: 'Travel' })[value] ?? value;

const readableStatus = (status?: string | null) =>
  status ? status.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()) : 'Active';

const formatDate = (date: string, locale?: string) =>
  new Date(date).toLocaleDateString(locale === 'kr' ? 'ko-KR' : locale === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'long',
    day: '2-digit',
  });

const AgentDetailPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const device = useDeviceDetect();
  const { id } = router.query;
  const agentId = typeof id === 'string' ? id : '';

  const [listingPage, setListingPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [networkTab, setNetworkTab] = useState<NetworkTab>('followers');
  const [networkPage, setNetworkPage] = useState(1);

  const {
    loading: agentLoading,
    data: agentData,
    previousData: previousAgentData,
    refetch: refetchAgent,
  } = useQuery<{ getMember: AgentDetail }>(GET_MEMBER, {
    skip: !agentId,
    fetchPolicy: 'no-cache',
    variables: { memberId: agentId },
  });

  const {
    loading: listingsLoading,
    data: listingsData,
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

  const {
    loading: followersLoading,
    data: followersData,
    previousData: previousFollowersData,
    refetch: refetchFollowers,
  } = useQuery<{
    getMemberFollowers: { list: NetworkFollow[]; metaCounter: { total: number }[] };
  }>(GET_MEMBER_FOLLOWERS, {
    skip: !agentId || networkTab !== 'followers',
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        page: networkPage,
        limit: NETWORK_LIMIT,
        search: { followingId: agentId },
      },
    },
  });

  const {
    loading: followingsLoading,
    data: followingsData,
    previousData: previousFollowingsData,
    refetch: refetchFollowings,
  } = useQuery<{
    getMemberFollowings: { list: NetworkFollow[]; metaCounter: { total: number }[] };
  }>(GET_MEMBER_FOLLOWINGS, {
    skip: !agentId || networkTab !== 'followings',
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        page: networkPage,
        limit: NETWORK_LIMIT,
        search: { followerId: agentId },
      },
    },
  });

  const [likeTargetPackage] = useMutation<{ likeTargetPackage: AgentPackage }>(
    LIKE_TARGET_PACKAGE,
  );
  const [createComment] = useMutation<{ createComment: ReviewComment }>(CREATE_COMMENT);
  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);

  const agent = agentData?.getMember ?? previousAgentData?.getMember ?? null;
  // A fresh `[]` on every render would re-run the like-state sync effect forever while loading.
  const listings = useMemo(() => listingsData?.getPackages.list ?? [], [listingsData]);
  const listingTotal = listingsData?.getPackages.metaCounter?.[0]?.total ?? 0;
  const listingTotalPages = Math.max(1, Math.ceil(listingTotal / LISTING_LIMIT));
  const reviews = reviewsData?.getComments.list ?? [];
  const reviewTotal = reviewsData?.getComments.metaCounter?.[0]?.total ?? 0;
  const reviewTotalPages = Math.max(1, Math.ceil(reviewTotal / REVIEW_LIMIT));
  const followers =
    followersData?.getMemberFollowers.list ?? previousFollowersData?.getMemberFollowers.list ?? [];
  const followings =
    followingsData?.getMemberFollowings.list ?? previousFollowingsData?.getMemberFollowings.list ?? [];
  const networkItems = networkTab === 'followers' ? followers : followings;
  const networkTotal =
    networkTab === 'followers'
      ? followersData?.getMemberFollowers.metaCounter?.[0]?.total ??
        previousFollowersData?.getMemberFollowers.metaCounter?.[0]?.total ??
        followerCount
      : followingsData?.getMemberFollowings.metaCounter?.[0]?.total ??
        previousFollowingsData?.getMemberFollowings.metaCounter?.[0]?.total ??
        agent?.memberFollowings ??
        0;
  const networkTotalPages = Math.max(1, Math.ceil(networkTotal / NETWORK_LIMIT));
  const networkLoading = (networkTab === 'followers' ? followersLoading : followingsLoading) && !networkItems.length;
  const displayName = (agent?: AgentDetail | null) =>
    agent?.memberNick || agent?.memberFullName || t('Insurance Agent');

  const packageLikeSourceStates = useMemo<Record<string, LikeState>>(
    () =>
      Object.fromEntries(
        listings.map((pkg) => [
          pkg._id,
          {
            liked: getMeLiked(pkg.meLiked),
            count: pkg.packageLikes ?? 0,
          },
        ]),
      ),
    [listings],
  );

  const packageLikeToggle = useLikeToggleMap({
    sourceStates: packageLikeSourceStates,
    isAuthenticated: () => Boolean(userVar()?._id),
    onUnauthenticated: () => sweetMixinErrorAlert(t('Please login to like packages.')),
    mutate: async (packageId, optimistic) => {
      const result = await likeTargetPackage({ variables: { packageId } });
      const updated = result.data?.likeTargetPackage;
      if (!updated) return null;

      return {
        liked: getMeLiked(updated.meLiked),
        count: updated.packageLikes ?? optimistic.count,
      };
    },
    onError: (message) => sweetMixinErrorAlert(message),
    errorMessage: t('Could not update package like.'),
  });

  const packageLikeStates = useMemo<Record<string, LikeState>>(
    () =>
      Object.fromEntries(
        listings.map((pkg) => [pkg._id, packageLikeToggle.getState(pkg._id)]),
      ),
    [listings, packageLikeToggle.getState],
  );

  useEffect(() => {
    if (!agent) return;
    setIsFollowing(agent.meFollowed?.[0]?.myFollowing ?? false);
    setFollowerCount(agent.memberFollowers ?? 0);
  }, [agent]);

  const refetchNetwork = async () => {
    if (networkTab === 'followers') {
      await refetchFollowers();
      return;
    }
    await refetchFollowings();
  };

  const handleFollowTarget = async (targetId: string, currentlyFollowing: boolean, shouldRethrow = false) => {
    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert(t('Please login to follow agents.'));
      return;
    }
    if (user._id === targetId) {
      await sweetMixinErrorAlert(t('You cannot follow yourself.'));
      return;
    }

    try {
      if (currentlyFollowing) {
        await unsubscribe({ variables: { input: targetId } });
      } else {
        await subscribe({ variables: { input: targetId } });
      }
      await refetchAgent({ memberId: agentId });
      await refetchNetwork();
      await sweetTopSuccessAlert(t(currentlyFollowing ? 'Unfollowed member.' : 'Followed member.'));
    } catch (err: any) {
      await sweetMixinErrorAlert(
          err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ??
          err?.message ??
          t('Could not update follow status.'),
      );
      if (shouldRethrow) throw err;
    }
  };

  const handleFollowAgent = async () => {
    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert(t('Please login to follow agents.'));
      return;
    }
    if (user._id === agentId) {
      await sweetMixinErrorAlert(t('You cannot follow yourself.'));
      return;
    }

    const previousFollowing = isFollowing;
    const previousCount = followerCount;
    const nextFollowing = !isFollowing;

    setIsFollowing(nextFollowing);
    setFollowerCount((prev) => Math.max(0, prev + (nextFollowing ? 1 : -1)));

    try {
      await handleFollowTarget(agentId, previousFollowing, true);
    } catch {
      setIsFollowing(previousFollowing);
      setFollowerCount(previousCount);
    }
  };

  const changeNetworkTab = (nextTab: NetworkTab) => {
    setNetworkTab(nextTab);
    setNetworkPage(1);
  };

  const getNetworkMember = (item: NetworkFollow) =>
    networkTab === 'followers' ? item.followerData : item.followingData;

  const handleLikePackage = (event: MouseEvent, packageId: string) => {
    event.stopPropagation();
    void packageLikeToggle.toggle(packageId);
  };

  const handlePostReview = async () => {
    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert(t('Please login to submit a review.'));
      return;
    }
    if (user._id === agentId) {
      await sweetMixinErrorAlert(t('You cannot write a review for yourself.'));
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
      await sweetTopSuccessAlert(t('Review submitted!'));
    } catch (err: any) {
      await sweetMixinErrorAlert(
          err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ??
          err?.message ??
          t('Could not submit your review.'),
      );
    }
  };

  const renderPagination = (
    page: number,
    totalPages: number,
    setPage: (page: number) => void,
    keyPrefix: string,
  ) =>
    totalPages > 1 && (
      <Stack className='agent-detail-pagination'>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          <ChevronLeftIcon />
        </button>
        {buildPageNumbers(page, totalPages).map((item, index) =>
          item === '...' ? (
            <span key={`${keyPrefix}-dots-${index}`}>...</span>
          ) : (
            <button key={item} className={page === item ? 'active' : ''} onClick={() => setPage(item)}>
              {item}
            </button>
          ),
        )}
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          <ChevronRightIcon />
        </button>
      </Stack>
    );

  if (agentLoading && !agent) {
    return (
      <Stack className='agent-detail-page'>
        <Stack className='agent-detail-shell'>
          <Stack className='agent-detail-profile skeleton'>
            <Box className='agent-detail-photo skeleton-block' />
            <Stack className='agent-detail-profile-info'>
              <Box className='skeleton-line short' />
              <Box className='skeleton-line wide' />
              <Box className='skeleton-line medium' />
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
          <h1>{t('Agent not found')}</h1>
          <button onClick={() => router.push('/agents')}>{t('Back to Agents')}</button>
        </Stack>
      </Stack>
    );
  }

  if (device === 'mobile') {
    return (
      <MobileAgentDetailPage
        agent={agent}
        isFollowing={isFollowing}
        followerCount={followerCount}
        networkTab={networkTab}
        networkItems={networkItems}
        networkTotal={networkTotal}
        networkPage={networkPage}
        networkTotalPages={networkTotalPages}
        networkLoading={networkLoading}
        listings={listings}
        listingPage={listingPage}
        listingTotal={listingTotal}
        listingTotalPages={listingTotalPages}
        listingsLoading={listingsLoading}
        reviews={reviews}
        reviewText={reviewText}
        reviewPage={reviewPage}
        reviewTotal={reviewTotal}
        reviewTotalPages={reviewTotalPages}
        reviewsLoading={reviewsLoading}
        packageLikeStates={packageLikeStates}
        getAsset={getAvatar}
        onAvatarError={handleAvatarError}
        getPackageImage={getPackageImage}
        displayName={displayName}
        readableStatus={readableStatus}
        typeLabelKey={typeLabelKey}
        formatDate={formatDate}
        routerLocale={router.locale}
        getNetworkMember={getNetworkMember}
        onBack={() => router.push('/agents')}
        onFollowAgent={handleFollowAgent}
        onChangeNetworkTab={changeNetworkTab}
        onSetNetworkPage={setNetworkPage}
        onSetListingPage={setListingPage}
        onSetReviewPage={setReviewPage}
        onLikePackage={handleLikePackage}
        onOpenPackage={(packageId) => router.push(`/packages/${packageId}`)}
        onToggleFollowTarget={(targetId, alreadyFollowing) => handleFollowTarget(targetId, alreadyFollowing)}
        onReviewTextChange={(event) => setReviewText(event.target.value)}
        onPostReview={handlePostReview}
      />
    );
  }

  const stats = [
    { label: 'Views', value: agent.memberViews },
    { label: 'Likes', value: agent.memberLikes },
    { label: 'Reviews', value: agent.memberComments },
    { label: 'Followers', value: followerCount },
  ];

  return (
    <Stack className='agent-detail-page'>
      <Stack className='agent-detail-shell'>
        <button type='button' className='agent-detail-back' onClick={() => router.push('/agents')}>
          <ArrowBackRoundedIcon />
          {t('Back to Agents')}
        </button>

        <Stack className='agent-detail-profile'>
          <Box
            component='img'
            src={getAvatar(agent.memberImage)}
            alt={displayName(agent)}
            className='agent-detail-photo'
            onError={handleAvatarError}
          />
          <Stack className='agent-detail-profile-info'>
            <Stack className='agent-detail-chips'>
              <span className='status'>{t(readableStatus(agent.memberStatus))}</span>
              <span>{agent.memberType ? t(readableStatus(agent.memberType)) : t('Agent')}</span>
              {agent.memberRank != null && <span>{t('Score')} {agent.memberRank}</span>}
            </Stack>
            <h1>{displayName(agent)}</h1>
            {agent.memberDesc && <p>{agent.memberDesc}</p>}
            {agent.memberPhone ? (
              <a className='agent-detail-phone' href={`tel:${agent.memberPhone}`}>
                <PhoneOutlinedIcon />
                {agent.memberPhone}
              </a>
            ) : (
              <span className='agent-detail-phone muted'>
                <PhoneOutlinedIcon />
                {t('Contact unavailable')}
              </span>
            )}
          </Stack>
          <button
            type='button'
            className={`agent-detail-follow${isFollowing ? ' following' : ''}`}
            onClick={handleFollowAgent}
          >
            {isFollowing ? <CheckRoundedIcon /> : <AddRoundedIcon />}
            <span>{t(isFollowing ? 'Unfollow' : 'Follow')}</span>
          </button>
        </Stack>

        <Box className='agent-detail-stats'>
          {stats.map((stat) => (
            <Stack key={stat.label}>
              <strong>{formatCount(stat.value)}</strong>
              <span>{t(stat.label)}</span>
            </Stack>
          ))}
        </Box>

        <Box className='agent-detail-body'>
          <Stack className='agent-detail-main'>
            <Stack component='section' className='agent-detail-section'>
              <Stack className='agent-detail-section-head'>
                <h2>{t('Active Listings')}</h2>
                <span>{listingTotal}</span>
              </Stack>

              {listingsLoading ? (
                <Box className='agent-listing-grid'>
                  {Array.from({ length: 2 }).map((_, index) => (
                    <Stack key={index} className='agent-listing-card skeleton'>
                      <Box className='agent-listing-image-wrap skeleton-block' />
                      <Box className='skeleton-line medium' />
                    </Stack>
                  ))}
                </Box>
              ) : listings.length === 0 ? (
                <Stack className='agent-detail-panel-empty'>{t('No active listings found.')}</Stack>
              ) : (
                <Box className='agent-listing-grid'>
                  {listings.map((pkg, index) => {
                    const likeState = packageLikeStates[pkg._id] ?? {
                      liked: getMeLiked(pkg.meLiked),
                      count: pkg.packageLikes ?? 0,
                    };
                    const isTopRanked = index < 3 && (pkg.packageRank ?? 0) > 0;
                    const meta = [
                      pkg.packageMinAge != null
                        ? `${t('Ages')} ${pkg.packageMinAge}-${pkg.packageMaxAge ?? '∞'}`
                        : null,
                      pkg.packageCoverageLimit != null
                        ? `$${pkg.packageCoverageLimit.toLocaleString()} ${t('limit')}`
                        : null,
                    ].filter(Boolean);

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
                            onError={(event: SyntheticEvent<HTMLImageElement>) => {
                              const image = event.currentTarget;
                              if (!image.src.endsWith(PLACEHOLDER_IMAGE)) image.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          {isTopRanked && <span className='agent-listing-top'>{t('TOP')}</span>}
                        </Box>
                        <Stack className='agent-listing-body'>
                          <span className='agent-listing-type'>
                            {t(typeLabelKey(pkg.packageType))} {t('Coverage')}
                          </span>
                          <h3>{pkg.packageTitle}</h3>
                          {meta.length > 0 && <span className='agent-listing-meta'>{meta.join(' · ')}</span>}
                          <Stack className='agent-listing-footer'>
                            <span className='agent-listing-price'>
                              <b>${pkg.packagePrice.toLocaleString()}</b> {t('/ month')}
                            </span>
                            <Stack className='agent-listing-stats'>
                              <span>
                                <VisibilityOutlinedIcon />
                                {formatCount(pkg.packageViews)}
                              </span>
                              <button
                                type='button'
                                className={likeState.liked ? 'liked' : ''}
                                onClick={(event) => handleLikePackage(event, pkg._id)}
                              >
                                {likeState.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                {formatCount(likeState.count)}
                              </button>
                              <span>
                                <ChatBubbleOutlineRoundedIcon />
                                {formatCount(pkg.packageComments)}
                              </span>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>
                    );
                  })}
                </Box>
              )}

              {renderPagination(listingPage, listingTotalPages, setListingPage, 'listing')}
            </Stack>

            <Stack component='section' className='agent-detail-section'>
              <Stack className='agent-detail-section-head'>
                <h2>{t('Reviews')}</h2>
                <span>{reviewTotal}</span>
              </Stack>

              {reviewsLoading ? (
                <Stack className='agent-detail-panel-empty'>{t('Loading reviews...')}</Stack>
              ) : reviews.length === 0 ? (
                <Stack className='agent-detail-panel-empty'>{t('No reviews yet.')}</Stack>
              ) : (
                <Stack className='agent-review-list'>
                  {reviews.map((review) => (
                    <Stack key={review._id} className='agent-review-card'>
                      <Box
                        component='img'
                        src={getAvatar(review.memberData?.memberImage)}
                        alt={review.memberData?.memberNick ?? t('Member')}
                        onError={handleAvatarError}
                      />
                      <Stack className='agent-review-body'>
                        <Stack className='agent-review-author'>
                          <strong>{review.memberData?.memberNick ?? t('Member')}</strong>
                          <span>{formatDate(review.createdAt, router.locale)}</span>
                        </Stack>
                        <p>{review.commentContent}</p>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}

              {renderPagination(reviewPage, reviewTotalPages, setReviewPage, 'review')}

              <Stack className='agent-detail-review-form'>
                <label htmlFor='agent-review'>{t('Leave A Review')}</label>
                <textarea
                  id='agent-review'
                  value={reviewText}
                  placeholder={t('Write your review here...')}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReviewText(event.target.value)}
                />
                <button
                  type='button'
                  className='agent-detail-submit'
                  disabled={!reviewText.trim()}
                  onClick={handlePostReview}
                >
                  {t('Submit Review')}
                  <span className='arrow-dot' aria-hidden='true'>
                    <ArrowForwardRoundedIcon />
                  </span>
                </button>
              </Stack>
            </Stack>
          </Stack>

          <Stack component='aside' className='agent-network-section'>
            <h2>{t('Agent Network')}</h2>
            <Box className='agent-network-tabs'>
              <button
                type='button'
                className={networkTab === 'followers' ? 'active' : ''}
                onClick={() => changeNetworkTab('followers')}
              >
                {t('Followers')}
                <strong>{formatCount(followerCount)}</strong>
              </button>
              <button
                type='button'
                className={networkTab === 'followings' ? 'active' : ''}
                onClick={() => changeNetworkTab('followings')}
              >
                {t('Followings')}
                <strong>{formatCount(agent.memberFollowings)}</strong>
              </button>
            </Box>

            {networkLoading ? (
              <Stack className='agent-network-list'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Box key={index} className='agent-network-skeleton skeleton-block' />
                ))}
              </Stack>
            ) : networkItems.length === 0 ? (
              <Stack className='agent-detail-panel-empty'>
                {t(networkTab === 'followers' ? 'No followers yet.' : 'No followings yet.')}
              </Stack>
            ) : (
              <Stack className='agent-network-list'>
                {networkItems.map((item) => {
                  const member = getNetworkMember(item);
                  const targetId = member?._id ?? '';
                  const name = member?.memberNick || member?.memberFullName || t('Member');
                  const alreadyFollowing = item.meFollowed?.[0]?.myFollowing ?? false;
                  const isCurrentUser = userVar()?._id === targetId;

                  return (
                    <Stack
                      key={item._id}
                      className='agent-network-row'
                      onClick={() => targetId && router.push(`/agents/${targetId}`)}
                    >
                      <Box
                        component='img'
                        src={getAvatar(member?.memberImage)}
                        alt={name}
                        onError={handleAvatarError}
                      />
                      <Stack className='agent-network-name'>
                        <strong>{name}</strong>
                        <span>
                          {formatCount(member?.memberFollowers)} {t('Followers')} · {formatCount(member?.memberLikes)}{' '}
                          {t('Likes')}
                        </span>
                      </Stack>
                      <button
                        type='button'
                        className={`agent-network-follow${alreadyFollowing ? ' following' : ''}`}
                        disabled={isCurrentUser}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (targetId) handleFollowTarget(targetId, alreadyFollowing);
                        }}
                      >
                        {isCurrentUser ? t('You') : t(alreadyFollowing ? 'Unfollow' : 'Follow')}
                      </button>
                    </Stack>
                  );
                })}
              </Stack>
            )}

            {renderPagination(networkPage, networkTotalPages, setNetworkPage, 'network')}
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};

export default withLayoutMain(AgentDetailPage);

export const getServerSideProps = async ({ locale = 'en' }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
