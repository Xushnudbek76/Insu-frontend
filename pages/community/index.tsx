import type { ChangeEvent, MouseEvent } from 'react';
import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Box, Stack } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import withLayoutMain from '@/layout/LayoutHome';
import { GET_BOARD_ARTICLES } from '@/apollo/board-article/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '@/apollo/board-article/mutation';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import MobileCommunityPage from '@/libs/components/mobile/community/MobileCommunityPage';
import { userVar } from '@/apollo/store';
import { getMeLiked, useLikeToggleMap } from '@/libs/hooks/useLikeToggle';
import { sweetMixinErrorAlert } from '@/libs/sweetAlert';
import { BoardArticleCategory } from '@/libs/enums/board-article.enum';
import { toAssetUrl } from '@/libs/api';
import { buildPageNumbers } from '@/libs/utils/pagination';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useTranslation } from 'next-i18next/pages';
import { formatLocaleDate } from '@/libs/utils/locale';

export const getStaticProps = async ({ locale = 'en' }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const LIMIT = 8;

const CATEGORY_CONFIG = [
  {
    value: BoardArticleCategory.FREE,
    label: 'Free',
    description: 'Express your opinions freely here without content restrictions.',
    icon: ForumOutlinedIcon,
  },
  {
    value: BoardArticleCategory.NOTICE,
    label: 'Notice',
    description: 'Official updates, announcements, and important platform notices.',
    icon: CampaignOutlinedIcon,
  },
  {
    value: BoardArticleCategory.NEWS,
    label: 'News',
    description: 'Insurance trends, market updates, and practical industry insights.',
    icon: NewspaperOutlinedIcon,
  },
  {
    value: BoardArticleCategory.REVIEW,
    label: 'Reviews',
    description: 'Recommendations, feedback, and real member experiences.',
    icon: ReviewsOutlinedIcon,
  },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'articleViews', label: 'Most Viewed' },
  { value: 'articleLikes', label: 'Most Liked' },
  { value: 'articleComments', label: 'Most Discussed' },
];

interface ArticleMember {
  _id: string;
  memberNick?: string | null;
  memberImage?: string | null;
}

interface BoardArticleData {
  _id: string;
  articleCategory: BoardArticleCategory;
  articleTitle: string;
  articleContent: string;
  articleImage?: string | null;
  articleViews: number;
  articleLikes: number;
  articleComments: number;
  createdAt: string;
  memberData?: ArticleMember | null;
  meLiked?: { myFavorite?: boolean | null }[] | null;
}

interface GetBoardArticlesResponse {
  getBoardArticles: {
    list: BoardArticleData[];
    metaCounter: { total: number }[];
  };
}

const CommunityPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const device = useDeviceDetect();
  const [category, setCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
  const [searchText, setSearchText] = useState('');
  const [appliedSearchText, setAppliedSearchText] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);

  const activeCategory = useMemo(
    () => CATEGORY_CONFIG.find((item) => item.value === category) ?? CATEGORY_CONFIG[0],
    [category],
  );

  const { loading, data } = useQuery<GetBoardArticlesResponse>(GET_BOARD_ARTICLES, {
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        page,
        limit: LIMIT,
        sort,
        direction: 'DESC',
        search: {
          articleCategory: category,
          ...(appliedSearchText.trim() ? { text: appliedSearchText.trim() } : {}),
        },
      },
    },
  });

  const [likeTargetBoardArticle] = useMutation<{
    likeTargetBoardArticle: { _id: string; articleLikes: number };
  }>(LIKE_TARGET_BOARD_ARTICLE);

  const articles = data?.getBoardArticles.list ?? [];
  const total = data?.getBoardArticles.metaCounter?.[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const articleLikes = useLikeToggleMap<BoardArticleData>({
    items: articles,
    getId: (article) => article._id,
    getItemLiked: (article) => getMeLiked(article.meLiked),
    getItemCount: (article) => article.articleLikes,
    isAuthenticated: () => Boolean(userVar()?._id),
    onUnauthenticated: () => sweetMixinErrorAlert(t('Please login to like posts.')),
    mutate: async (articleId, optimistic) => {
      const result = await likeTargetBoardArticle({ variables: { articleId } });
      const updated = result.data?.likeTargetBoardArticle;
      if (!updated) return null;

      return {
        liked: optimistic.liked,
        count: updated.articleLikes,
      };
    },
    onError: (message) => sweetMixinErrorAlert(message),
    errorMessage: t('Could not update likes.'),
  });

  const articleLikeStates = useMemo(
    () =>
      Object.fromEntries(
        articles.map((article) => {
          const likeState = articleLikes.getState(article._id, {
            liked: getMeLiked(article.meLiked),
            count: article.articleLikes,
          });

          return [article._id, likeState];
        }),
      ),
    [articles, articleLikes.getState],
  );

  const getArticleImage = (image?: string | null) =>
    toAssetUrl(image) ?? '/img/placeholder-article.svg';

  const formatDate = (date: string) =>
    formatLocaleDate(date, router.locale, {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    });

  const handleSearchSubmit = () => {
    setPage(1);
    setAppliedSearchText(searchText);
  };

  const handleSearchEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSearchSubmit();
  };

  const handleChangeCategory = (value: BoardArticleCategory) => {
    setCategory(value);
    setPage(1);
  };

  const handleToggleArticleLike = (event: MouseEvent, articleId: string) => {
    event.stopPropagation();
    void articleLikes.toggle(articleId);
  };

  if (device === 'mobile') {
    return (
      <MobileCommunityPage
        category={category}
        searchText={searchText}
        sort={sort}
        page={page}
        totalPages={totalPages}
        activeCategory={activeCategory}
        categories={CATEGORY_CONFIG}
        articles={articles}
        total={total}
        loading={loading}
        sortOptions={SORT_OPTIONS}
        getArticleImage={getArticleImage}
        formatDate={formatDate}
        articleLikeStates={articleLikeStates}
        onSearchChange={(event) => setSearchText(event.target.value)}
        onSearchKeyDown={handleSearchEnter}
        onSearchSubmit={handleSearchSubmit}
        onCategoryChange={handleChangeCategory}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onOpenWrite={() => router.push('/community/write')}
        onOpenArticle={(articleId) => router.push(`/community/${articleId}`)}
        onToggleArticleLike={handleToggleArticleLike}
      />
    );
  }

  return (
    <Stack className='community-page'>
      <Box className='community-hero'>
        <Box className='community-hero-overlay' />
        <Box className='community-shell'>
          <Box className='community-hero-content'>
            <span className='community-eyebrow'>{t('Connect and Learn')}</span>
            <h1>{t('Community')}</h1>
            <p>
              {t('Discover conversations, updates, and member stories across insurance topics that matter most to you.')}
            </p>
          </Box>
        </Box>
      </Box>

      <Box className='community-shell community-main'>
        <Box className='community-sidebar'>
          <Box className='community-sidebar-card'>
            <div className='community-sidebar-icon'>
              <ForumOutlinedIcon />
            </div>
            <h2>{t('Categories')}</h2>
            <p>{t('Community Channels')}</p>

            <div className='community-category-list'>
              {CATEGORY_CONFIG.map((item) => {
                const Icon = item.icon;
                const active = item.value === category;

                return (
                  <button
                    key={item.value}
                    className={`community-category-btn${active ? ' active' : ''}`}
                    onClick={() => handleChangeCategory(item.value)}
                  >
                    <Icon />
                    <span>{t(item.label)}</span>
                  </button>
                );
              })}
            </div>

            <button
              className='community-create-btn'
              onClick={(event) => {
                
                router.push('/community/write');
              }}
            >
              <AddOutlinedIcon />
              {t('Create Post')}
            </button>
          </Box>
        </Box>

        <Box className='community-content'>
          <Box className='community-toolbar'>
            <Box>
              <h2>{t('{{category}} Board', { category: t(activeCategory.label) })}</h2>
              <p>{t(activeCategory.description)}</p>
            </Box>

            <button className='community-top-write' onClick={() => router.push('/community/write')}>
              {t('Write')}
            </button>
          </Box>

          <Box className='community-filters'>
            <div className='community-search-box'>
              <SearchOutlinedIcon />
              <input
                type='text'
                value={searchText}
                placeholder={t('Search posts')}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchText(event.target.value)}
                onKeyDown={handleSearchEnter}
              />
              <button onClick={handleSearchSubmit}>{t('Search')}</button>
            </div>

            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </Box>

          {loading ? (
            <Box className='community-grid'>
              {Array.from({ length: 4 }).map((_, index) => (
                <Box key={index} className='community-card skeleton'>
                  <div className='community-card-image skeleton-block' />
                  <div className='community-card-body'>
                    <div className='skeleton-line wide' />
                    <div className='skeleton-line medium' />
                    <div className='skeleton-line short' />
                  </div>
                </Box>
              ))}
            </Box>
          ) : articles.length === 0 ? (
            <Box className='community-empty'>
              <h3>{t('No posts found')}</h3>
              <p>{t('Try changing the category or search terms.')}</p>
            </Box>
          ) : (
            <Box className='community-grid'>
              {articles.map((article) => {
                const likeState = articleLikeStates[article._id] ?? {
                  liked: getMeLiked(article.meLiked),
                  count: article.articleLikes,
                };

                return (
                  <Box
                    key={article._id}
                    className='community-card'
                    onClick={() => router.push(`/community/${article._id}`)}
                  >
                    <div
                      className='community-card-image'
                      style={{ backgroundImage: `url(${getArticleImage(article.articleImage)})` }}
                    >
                      <div className='community-card-date'>
                        <span>{formatLocaleDate(article.createdAt, router.locale, { month: 'long' })}</span>
                        <strong>
                          {formatLocaleDate(article.createdAt, router.locale, {
                            day: '2-digit',
                          })}
                        </strong>
                      </div>
                    </div>

                    <div className='community-card-body'>
                      <div className='community-card-meta-top'>
                        <span className='community-category-pill'>{t(activeCategory.label)}</span>
                        <span className='community-author'>
                          {article.memberData?.memberNick ?? t('Community Member')}
                        </span>
                      </div>
                      <h3>{article.articleTitle}</h3>
                      <p>{article.articleContent}</p>
                      <div className='community-card-footer'>
                        <span>{formatDate(article.createdAt)}</span>
                        <div
                          className='community-stats'
                          onClick={(event) => event.stopPropagation()}
                        >
                          <span>
                            <VisibilityOutlinedIcon />
                            {article.articleViews}
                          </span>
                          <button
                            type='button'
                            className={likeState.liked ? 'liked' : ''}
                            onClick={(event) => handleToggleArticleLike(event, article._id)}
                          >
                            {likeState.liked ? <FavoriteIcon /> : <FavoriteBorderOutlinedIcon />}
                            {likeState.count}
                          </button>
                          <span>
                            <ChatBubbleOutlineOutlinedIcon />
                            {article.articleComments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Box>
                );
              })}
            </Box>
          )}

          <Box className='community-pagination-wrap'>
            <div className='community-pagination'>
              <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                Prev
              </button>
              {buildPageNumbers(page, totalPages).map((item, index) =>
                item === '...' ? (
                  <span key={`dots-${index}`} className='community-dots'>
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    className={page === item ? 'active' : ''}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}
              <button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
                Next
              </button>
            </div>
            <p>Total {total} articles available</p>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};

export default withLayoutMain(CommunityPage);
