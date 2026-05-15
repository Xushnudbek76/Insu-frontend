import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
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
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import withLayoutMain from '@/layout/LayoutHome';
import { userVar } from '@/apollo/store';
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

const formatCount = (value?: number | null) =>
  value == null ? '0' : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

const getAsset = (path?: string | null) => toAssetUrl(path) ?? '/img/placeholder-article.svg';

const getPackageImage = (images?: string[] | null) =>
  toAssetUrl(images?.[0]) ?? '/img/placeholder-article.svg';

const typeLabelKey = (value: string) =>
  ({ AUTO: 'Auto', HOME: 'Home Type', HEALTH: 'Health', TRAVEL: 'Travel' })[value] ?? value;

const readableStatus = (status?: string | null) =>
  status ? status.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()) : 'Active';

const formatDate = (date: string, locale?: string) =>
  new Date(date).toLocaleDateString(locale === 'kr' ? 'ko-KR' : locale === 'ru' ? 'ru-RU' : 'en-US', {
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
  const { t } = useTranslation('common');
  const { id } = router.query;
  const agentId = typeof id === 'string' ? id : '';

  const [listingPage, setListingPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [packageLikes, setPackageLikes] = useState<Record<string, number>>({});
  const [packageLiked, setPackageLiked] = useState<Record<string, boolean>>({});
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
  const listings = listingsData?.getPackages.list ?? [];
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

  const handleLikePackage = async (event: MouseEvent, packageId: string) => {
    event.stopPropagation();

    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert(t('Please login to like packages.'));
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
          t('Could not update package like.'),
      );
    }
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

  if (agentLoading && !agent) {
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
          <h1>{t('Agent not found')}</h1>
          <button onClick={() => router.push('/agents')}>{t('Back to Agents')}</button>
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
              <span>{agent.memberPhone || t('Contact unavailable')}</span>
            </Stack>
            <Stack className='agent-detail-chips'>
              <span>{t(readableStatus(agent.memberStatus))}</span>
              <span>{agent.memberType || t('Agent')}</span>
              {agent.memberRank != null && <span>{t('Rank')} #{agent.memberRank}</span>}
            </Stack>
            {agent.memberDesc && <p>{agent.memberDesc}</p>}
            <Stack className='agent-detail-follow-row'>
              <button className={isFollowing ? 'following' : ''} onClick={handleFollowAgent}>
                {isFollowing ? <PersonRemoveOutlinedIcon /> : <PersonAddAltOutlinedIcon />}
                <span>{t(isFollowing ? 'Unfollow' : 'Follow')}</span>
              </button>
              {isFollowing && <strong>{t('Following')}</strong>}
            </Stack>
          </Stack>
          <Stack className='agent-detail-stats'>
            <Stack>
              <VisibilityOutlinedIcon />
              <strong>{formatCount(agent.memberViews)}</strong>
              <span>{t('Views')}</span>
            </Stack>
            <Stack>
              <FavoriteIcon />
              <strong>{formatCount(agent.memberLikes)}</strong>
              <span>{t('Likes')}</span>
            </Stack>
            <Stack>
              <ChatBubbleIcon />
              <strong>{formatCount(agent.memberComments)}</strong>
              <span>{t('Reviews')}</span>
            </Stack>
            <Stack>
              <PersonOutlineOutlinedIcon />
              <strong>{formatCount(followerCount)}</strong>
              <span>{t('Followers')}</span>
            </Stack>
          </Stack>
        </Stack>

        <Stack className='agent-network-section'>
          <Stack className='agent-detail-section-head agent-network-head'>
            <Stack>
              <span>{t('Agent Network')}</span>
              <h2>{t('Followers & Followings')}</h2>
            </Stack>
            <Stack className='agent-network-tabs'>
              <button
                className={networkTab === 'followers' ? 'active' : ''}
                onClick={() => changeNetworkTab('followers')}
              >
                <PersonOutlineOutlinedIcon />
                <span>{t('Followers')}</span>
                <strong>{formatCount(followerCount)}</strong>
              </button>
              <button
                className={networkTab === 'followings' ? 'active' : ''}
                onClick={() => changeNetworkTab('followings')}
              >
                <PersonAddAltOutlinedIcon />
                <span>{t('Followings')}</span>
                <strong>{formatCount(agent.memberFollowings)}</strong>
              </button>
            </Stack>
          </Stack>

          <Stack className='agent-network-list'>
            <Box className='agent-network-table-head'>
              <span>{t('Name')}</span>
              <span>{t('Details')}</span>
              <span>{t('Subscription')}</span>
            </Box>

            {networkLoading ? (
              <Stack className='agent-network-loading'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Box key={index} className='agent-network-skeleton skeleton-block' />
                ))}
              </Stack>
            ) : networkItems.length === 0 ? (
              <Stack className='agent-detail-panel-empty'>
                {t(networkTab === 'followers' ? 'No followers yet.' : 'No followings yet.')}
              </Stack>
            ) : (
              networkItems.map((item) => {
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
                    <Stack className='agent-network-name'>
                      <Box component='img' src={getAsset(member?.memberImage)} alt={name} />
                      <Stack>
                        <strong>{name}</strong>
                        <span>{member?.memberType || t('Member')}</span>
                      </Stack>
                    </Stack>
                    <Stack className='agent-network-details'>
                      <span>{t('Followers')} ({formatCount(member?.memberFollowers)})</span>
                      <span>{t('Followings')} ({formatCount(member?.memberFollowings)})</span>
                      <span>
                        <FavoriteBorderIcon />
                        ({formatCount(member?.memberLikes)})
                      </span>
                    </Stack>
                    <Stack className='agent-network-actions'>
                      <button
                        className={alreadyFollowing ? 'following' : ''}
                        disabled={isCurrentUser}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (targetId) handleFollowTarget(targetId, alreadyFollowing);
                        }}
                      >
                        {isCurrentUser ? t('You') : t(alreadyFollowing ? 'Unfollow' : 'Follow')}
                      </button>
                    </Stack>
                  </Stack>
                );
              })
            )}
          </Stack>

          {networkTotalPages > 1 && (
            <Stack className='agent-detail-pagination'>
              <button disabled={networkPage === 1} onClick={() => setNetworkPage((prev) => prev - 1)}>
                <ChevronLeftIcon />
              </button>
              {buildPageNumbers(networkPage, networkTotalPages).map((item, index) =>
                item === '...' ? (
                  <span key={`network-dots-${index}`}>...</span>
                ) : (
                  <button
                    key={item}
                    className={networkPage === item ? 'active' : ''}
                    onClick={() => setNetworkPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                disabled={networkPage === networkTotalPages}
                onClick={() => setNetworkPage((prev) => prev + 1)}
              >
                <ChevronRightIcon />
              </button>
            </Stack>
          )}
          {networkTotal > 0 && (
            <p className='agent-detail-total'>
              {t(networkTab === 'followers' ? 'Total followers' : 'Total followings', {
                count: networkTotal,
              })}
            </p>
          )}
        </Stack>

        <Stack className='agent-detail-section'>
          <Stack className='agent-detail-section-head'>
            <h2>{t('Active Listings')} ({listingTotal})</h2>
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
            <Stack className='agent-detail-panel-empty'>{t('No active listings found.')}</Stack>
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
                        <span className='agent-listing-top'>{t('TOP')}</span>
                      )}
                      <span className='agent-listing-price'>
                        ${pkg.packagePrice.toLocaleString()}
                      </span>
                    </Box>
                    <Stack className='agent-listing-body'>
                      <h3>{pkg.packageTitle}</h3>
                      <p>{t(typeLabelKey(pkg.packageType))} {t('Coverage')}</p>
                      <Stack className='agent-listing-meta'>
                        {pkg.packageMinAge != null && (
                          <span>{t('Ages')} {pkg.packageMinAge}-{pkg.packageMaxAge ?? '∞'}</span>
                        )}
                        {pkg.packageCoverageLimit != null && (
                          <span>${pkg.packageCoverageLimit.toLocaleString()} {t('limit')}</span>
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
          {listingTotal > 0 && (
            <p className='agent-detail-total'>
              {t('Total packages available', { count: listingTotal })}
            </p>
          )}
        </Stack>

        <Stack className='agent-detail-reviews'>
          <Stack className='agent-detail-review-intro'>
            <h2>{t('Reviews')}</h2>
            <p>{t('We are glad to see your feedback again.')}</p>
          </Stack>

          <Stack className='agent-detail-review-list'>
            <Stack className='agent-detail-review-title'>
              <StarBorderOutlinedIcon />
              <span>
                {t('review count', { count: reviewTotal, plural: reviewTotal !== 1 ? 's' : '' })}
              </span>
            </Stack>

            {reviewsLoading ? (
              <Stack className='agent-detail-panel-empty'>{t('Loading reviews...')}</Stack>
            ) : reviews.length === 0 ? (
              <Stack className='agent-detail-panel-empty'>{t('No reviews yet.')}</Stack>
            ) : (
              reviews.map((review) => (
                <Stack key={review._id} className='agent-review-card'>
                  <Stack className='agent-review-author'>
                    <Box
                      component='img'
                      src={getAsset(review.memberData?.memberImage)}
                      alt={review.memberData?.memberNick ?? t('Member')}
                    />
                    <Stack>
                      <strong>{review.memberData?.memberNick ?? t('Member')}</strong>
                      <span>{formatDate(review.createdAt, router.locale)}</span>
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
            <h3>{t('Leave A Review')}</h3>
            <label htmlFor='agent-review'>{t('Review')}</label>
            <textarea
              id='agent-review'
              value={reviewText}
              placeholder={t('Write your review here...')}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReviewText(event.target.value)}
            />
            <Stack className='agent-detail-review-actions'>
              <button disabled={!reviewText.trim()} onClick={handlePostReview}>
                <span>{t('Submit Review')}</span>
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

export const getServerSideProps = async ({ locale = 'en' }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
