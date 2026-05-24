import { ChangeEvent, MouseEvent } from 'react';
import { Box, Stack } from '@mui/material';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'next-i18next/pages';
import { buildPageNumbers } from '@/libs/utils/pagination';
import { formatCount } from '@/libs/utils/format';

interface AgentDetail {
  _id: string;
  memberType?: string | null;
  memberStatus?: string | null;
  memberPhone?: string | null;
  memberNick?: string | null;
  memberFullName?: string | null;
  memberImage?: string | null;
  memberDesc?: string | null;
  memberRank?: number | null;
  memberLikes?: number | null;
  memberViews?: number | null;
  memberComments?: number | null;
  memberFollowings?: number | null;
}

interface AgentPackage {
  _id: string;
  packageType: string;
  packageTitle: string;
  packagePrice: number;
  packageImages?: string[] | null;
  packageViews?: number | null;
  packageLikes?: number | null;
  packageComments?: number | null;
  packageCoverageLimit?: number | null;
  packageMinAge?: number | null;
  packageMaxAge?: number | null;
  meLiked?: { myFavorite: boolean }[] | null;
}

interface ReviewComment {
  _id: string;
  commentContent: string;
  createdAt: string;
  memberData?: { memberNick?: string | null; memberImage?: string | null } | null;
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
  meFollowed?: { myFollowing: boolean }[] | null;
  followerData?: NetworkMember | null;
  followingData?: NetworkMember | null;
}

type NetworkTab = 'followers' | 'followings';

interface MobileAgentDetailPageProps {
  agent: AgentDetail;
  isFollowing: boolean;
  followerCount: number;
  networkTab: NetworkTab;
  networkItems: NetworkFollow[];
  networkTotal: number;
  networkPage: number;
  networkTotalPages: number;
  networkLoading: boolean;
  listings: AgentPackage[];
  listingPage: number;
  listingTotal: number;
  listingTotalPages: number;
  listingsLoading: boolean;
  reviews: ReviewComment[];
  reviewText: string;
  reviewPage: number;
  reviewTotal: number;
  reviewTotalPages: number;
  reviewsLoading: boolean;
  packageLiked: Record<string, boolean>;
  packageLikes: Record<string, number>;
  getAsset: (path?: string | null) => string;
  getPackageImage: (images?: string[] | null) => string;
  displayName: (agent?: AgentDetail | null) => string;
  readableStatus: (status?: string | null) => string;
  typeLabelKey: (value: string) => string;
  formatDate: (date: string, locale?: string) => string;
  routerLocale?: string;
  getNetworkMember: (item: NetworkFollow) => NetworkMember | null | undefined;
  onBack: () => void;
  onFollowAgent: () => void;
  onChangeNetworkTab: (nextTab: NetworkTab) => void;
  onSetNetworkPage: (page: number) => void;
  onSetListingPage: (page: number) => void;
  onSetReviewPage: (page: number) => void;
  onLikePackage: (event: MouseEvent, packageId: string) => void;
  onOpenPackage: (packageId: string) => void;
  onToggleFollowTarget: (targetId: string, alreadyFollowing: boolean) => void;
  onReviewTextChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onPostReview: () => void;
}

const MobileAgentDetailPage = ({
  agent,
  isFollowing,
  followerCount,
  networkTab,
  networkItems,
  networkTotal,
  networkPage,
  networkTotalPages,
  networkLoading,
  listings,
  listingPage,
  listingTotal,
  listingTotalPages,
  listingsLoading,
  reviews,
  reviewText,
  reviewPage,
  reviewTotal,
  reviewTotalPages,
  reviewsLoading,
  packageLiked,
  packageLikes,
  getAsset,
  getPackageImage,
  displayName,
  readableStatus,
  typeLabelKey,
  formatDate,
  routerLocale,
  getNetworkMember,
  onBack,
  onFollowAgent,
  onChangeNetworkTab,
  onSetNetworkPage,
  onSetListingPage,
  onSetReviewPage,
  onLikePackage,
  onOpenPackage,
  onToggleFollowTarget,
  onReviewTextChange,
  onPostReview,
}: MobileAgentDetailPageProps) => {
  const { t } = useTranslation('common');

  return (
    <Stack className='mobile-agent-detail-page'>
      <button className='mobile-back-btn' onClick={onBack}>
        <ArrowBackOutlinedIcon />
        {t('Back to Agents')}
      </button>

      <Stack className='mobile-agent-profile-card'>
        <Box component='img' src={getAsset(agent.memberImage)} alt={displayName(agent)} className='mobile-agent-profile-photo' />
        <span>{t(readableStatus(agent.memberStatus))}</span>
        <h1>{displayName(agent)}</h1>
        <small>{agent.memberType || t('Agent')}</small>
        <div className='mobile-agent-phone'>
          <PhoneOutlinedIcon />
          <strong>{agent.memberPhone || t('Contact unavailable')}</strong>
        </div>
        {agent.memberDesc && <p>{agent.memberDesc}</p>}
        <button className={isFollowing ? 'following' : ''} onClick={onFollowAgent}>
          {isFollowing ? <PersonRemoveOutlinedIcon /> : <PersonAddAltOutlinedIcon />}
          {t(isFollowing ? 'Unfollow' : 'Follow')}
        </button>
        <Stack className='mobile-agent-summary-stats'>
          <div>
            <VisibilityOutlinedIcon />
            <strong>{formatCount(agent.memberViews)}</strong>
            <span>{t('Views')}</span>
          </div>
          <div>
            <FavoriteIcon />
            <strong>{formatCount(agent.memberLikes)}</strong>
            <span>{t('Likes')}</span>
          </div>
          <div>
            <ChatBubbleIcon />
            <strong>{formatCount(agent.memberComments)}</strong>
            <span>{t('Reviews')}</span>
          </div>
          <div>
            <PersonOutlineOutlinedIcon />
            <strong>{formatCount(followerCount)}</strong>
            <span>{t('Followers')}</span>
          </div>
        </Stack>
      </Stack>

      <Stack className='mobile-agent-section'>
        <div className='mobile-section-head'>
          <h2>{t('Followers & Followings')}</h2>
          <small>{formatCount(networkTotal)} people</small>
        </div>
        <Box className='mobile-category-scroll'>
          <button className={networkTab === 'followers' ? 'active' : ''} onClick={() => onChangeNetworkTab('followers')}>
            {t('Followers')}
          </button>
          <button className={networkTab === 'followings' ? 'active' : ''} onClick={() => onChangeNetworkTab('followings')}>
            {t('Followings')}
          </button>
        </Box>
        {networkLoading ? (
          <Box className='mobile-empty-card'><p>{t('Loading network...')}</p></Box>
        ) : networkItems.length === 0 ? (
          <Box className='mobile-empty-card'><p>{t(networkTab === 'followers' ? 'No followers yet.' : 'No followings yet.')}</p></Box>
        ) : (
          <Stack className='mobile-network-list'>
            {networkItems.map((item) => {
              const member = getNetworkMember(item);
              const targetId = member?._id ?? '';
              const name = member?.memberNick || member?.memberFullName || t('Member');
              const alreadyFollowing = item.meFollowed?.[0]?.myFollowing ?? false;
              return (
                <Stack key={item._id} className='mobile-network-card'>
                  <Box component='img' src={getAsset(member?.memberImage)} alt={name} />
                  <div>
                    <strong>{name}</strong>
                    <span>{member?.memberType || t('Member')}</span>
                    <small>
                      {t('Followers')} {formatCount(member?.memberFollowers)} · {t('Likes')} {formatCount(member?.memberLikes)}
                    </small>
                  </div>
                  <button onClick={() => targetId && onToggleFollowTarget(targetId, alreadyFollowing)}>
                    {t(alreadyFollowing ? 'Unfollow' : 'Follow')}
                  </button>
                </Stack>
              );
            })}
          </Stack>
        )}
        {networkTotalPages > 1 && (
          <Box className='mobile-pagination'>
            <button disabled={networkPage === 1} onClick={() => onSetNetworkPage(networkPage - 1)}>
              <ChevronLeftIcon />
            </button>
            {buildPageNumbers(networkPage, networkTotalPages).map((item, index) =>
              item === '...' ? <span key={`network-mobile-dots-${index}`}>…</span> : (
                <button key={item} className={item === networkPage ? 'active' : ''} onClick={() => onSetNetworkPage(item)}>
                  {item}
                </button>
              ),
            )}
            <button disabled={networkPage === networkTotalPages} onClick={() => onSetNetworkPage(networkPage + 1)}>
              <ChevronRightIcon />
            </button>
          </Box>
        )}
      </Stack>

      <Stack className='mobile-agent-section'>
        <div className='mobile-section-head'>
          <h2>{t('Active Listings')}</h2>
          <small>{listingTotal}</small>
        </div>
        {listingsLoading ? (
          <Box className='mobile-empty-card'><p>{t('Loading listings...')}</p></Box>
        ) : listings.length === 0 ? (
          <Box className='mobile-empty-card'><p>{t('No active listings found.')}</p></Box>
        ) : (
          <Box className='mobile-packages-list'>
            {listings.map((pkg) => {
              const liked = packageLiked[pkg._id] ?? pkg.meLiked?.[0]?.myFavorite ?? false;
              const likes = packageLikes[pkg._id] ?? pkg.packageLikes;
              return (
                <Stack key={pkg._id} className='mobile-package-card' onClick={() => onOpenPackage(pkg._id)}>
                  <Box className='mobile-package-image' style={{ backgroundImage: `url(${getPackageImage(pkg.packageImages)})` }} />
                  <Stack className='mobile-package-body'>
                    <div className='mobile-package-topline'>
                      <span>{t(typeLabelKey(pkg.packageType))}</span>
                      <strong>${pkg.packagePrice.toLocaleString()}/mo</strong>
                    </div>
                    <h3>{pkg.packageTitle}</h3>
                    <Stack className='mobile-package-badges'>
                      {pkg.packageCoverageLimit != null && <span>${pkg.packageCoverageLimit.toLocaleString()} limit</span>}
                      {pkg.packageMinAge != null && <span>Ages {pkg.packageMinAge}-{pkg.packageMaxAge ?? '∞'}</span>}
                    </Stack>
                    <Stack className='mobile-package-stats'>
                      <span><VisibilityOutlinedIcon />{formatCount(pkg.packageViews)}</span>
                      <button className={liked ? 'liked' : ''} onClick={(event) => onLikePackage(event, pkg._id)}>
                        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        {formatCount(likes)}
                      </button>
                      <span><ChatBubbleIcon />{formatCount(pkg.packageComments)}</span>
                    </Stack>
                  </Stack>
                </Stack>
              );
            })}
          </Box>
        )}
        {listingTotalPages > 1 && (
          <Box className='mobile-pagination'>
            <button disabled={listingPage === 1} onClick={() => onSetListingPage(listingPage - 1)}>
              <ChevronLeftIcon />
            </button>
            {buildPageNumbers(listingPage, listingTotalPages).map((item, index) =>
              item === '...' ? <span key={`listing-mobile-dots-${index}`}>…</span> : (
                <button key={item} className={item === listingPage ? 'active' : ''} onClick={() => onSetListingPage(item)}>
                  {item}
                </button>
              ),
            )}
            <button disabled={listingPage === listingTotalPages} onClick={() => onSetListingPage(listingPage + 1)}>
              <ChevronRightIcon />
            </button>
          </Box>
        )}
      </Stack>

      <Stack className='mobile-agent-section'>
        <div className='mobile-section-head'>
          <h2>{t('Reviews')}</h2>
          <small>{reviewTotal}</small>
        </div>
        {reviewsLoading ? (
          <Box className='mobile-empty-card'><p>{t('Loading reviews...')}</p></Box>
        ) : reviews.length === 0 ? (
          <Box className='mobile-empty-card'><p>{t('No reviews yet.')}</p></Box>
        ) : (
          <Stack className='mobile-review-list'>
            {reviews.map((review) => (
              <Stack key={review._id} className='mobile-review-card'>
                <div className='mobile-review-head'>
                  <Box component='img' src={getAsset(review.memberData?.memberImage)} alt={review.memberData?.memberNick ?? t('Member')} />
                  <div>
                    <strong>{review.memberData?.memberNick ?? t('Member')}</strong>
                    <span>{formatDate(review.createdAt, routerLocale)}</span>
                  </div>
                </div>
                <p>{review.commentContent}</p>
              </Stack>
            ))}
          </Stack>
        )}
        {reviewTotalPages > 1 && (
          <Box className='mobile-pagination'>
            <button disabled={reviewPage === 1} onClick={() => onSetReviewPage(reviewPage - 1)}>
              <ChevronLeftIcon />
            </button>
            {buildPageNumbers(reviewPage, reviewTotalPages).map((item, index) =>
              item === '...' ? <span key={`review-mobile-dots-${index}`}>…</span> : (
                <button key={item} className={item === reviewPage ? 'active' : ''} onClick={() => onSetReviewPage(item)}>
                  {item}
                </button>
              ),
            )}
            <button disabled={reviewPage === reviewTotalPages} onClick={() => onSetReviewPage(reviewPage + 1)}>
              <ChevronRightIcon />
            </button>
          </Box>
        )}
        <Stack className='mobile-review-form'>
          <div className='mobile-review-form-head'>
            <StarBorderOutlinedIcon />
            <strong>{t('Leave A Review')}</strong>
          </div>
          <textarea value={reviewText} placeholder={t('Write your review here...')} onChange={onReviewTextChange} />
          <button disabled={!reviewText.trim()} onClick={onPostReview}>
            {t('Submit Review')}
          </button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default MobileAgentDetailPage;
