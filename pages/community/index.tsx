import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Stack } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import withLayoutMain from '@/layout/LayoutHome';
import { initializeApollo } from '@/apollo/client';
import { GET_BOARD_ARTICLES } from '@/apollo/board-article/query';
import { BoardArticleCategory } from '@/libs/enums/board-article.enum';
import { toAssetUrl } from '@/libs/api';

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
}

interface GetBoardArticlesResponse {
  getBoardArticles: {
    list: BoardArticleData[];
    metaCounter: { total: number }[];
  };
}

const CommunityPage: NextPage = () => {
  const router = useRouter();
  const [category, setCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
  const [articles, setArticles] = useState<BoardArticleData[]>([]);
  const [searchText, setSearchText] = useState('');
  const [appliedSearchText, setAppliedSearchText] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const activeCategory = useMemo(
    () => CATEGORY_CONFIG.find((item) => item.value === category) ?? CATEGORY_CONFIG[0],
    [category],
  );

  useEffect(() => {
    const client = initializeApollo(null);
    setLoading(true);

    client
      .query<GetBoardArticlesResponse>({
        query: GET_BOARD_ARTICLES,
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
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        setArticles(res.data.getBoardArticles.list || []);
        setTotal(res.data.getBoardArticles.metaCounter?.[0]?.total ?? 0);
      })
      .catch((err) => {
        console.error('getBoardArticles error', err);
        setArticles([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [category, page, sort, appliedSearchText]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const getArticleImage = (image?: string | null) =>
    toAssetUrl(image) ?? '/img/placeholder-article.svg';

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
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

  const buildPageNumbers = (): Array<number | '...'> => {
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

  return (
    <Stack className='community-page'>
      <Box className='community-hero'>
        <Box className='community-hero-overlay' />
        <Box className='community-shell'>
          <Box className='community-hero-content'>
            <span className='community-eyebrow'>Connect and Learn</span>
            <h1>Community</h1>
            <p>
              Discover conversations, updates, and member stories across insurance topics
              that matter most to you.
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
            <h2>Categories</h2>
            <p>Community Channels</p>

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
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              className='community-create-btn'
              onClick={() => router.push('/community/write')}
            >
              <AddOutlinedIcon />
              Create Post
            </button>
          </Box>
        </Box>

        <Box className='community-content'>
          <Box className='community-toolbar'>
            <Box>
              <h2>{activeCategory.label} Board</h2>
              <p>{activeCategory.description}</p>
            </Box>

            <button className='community-top-write' onClick={() => router.push('/community/write')}>
              Write
            </button>
          </Box>

          <Box className='community-filters'>
            <div className='community-search-box'>
              <SearchOutlinedIcon />
              <input
                type='text'
                value={searchText}
                placeholder='Search posts'
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchText(event.target.value)}
                onKeyDown={handleSearchEnter}
              />
              <button onClick={handleSearchSubmit}>Search</button>
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
                  {option.label}
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
              <h3>No posts found</h3>
              <p>Try changing the category or search terms.</p>
            </Box>
          ) : (
            <Box className='community-grid'>
              {articles.map((article) => (
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
                      <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'long' })}</span>
                      <strong>
                        {new Date(article.createdAt).toLocaleDateString('en-US', {
                          day: '2-digit',
                        })}
                      </strong>
                    </div>
                  </div>

                  <div className='community-card-body'>
                    <div className='community-card-meta-top'>
                      <span className='community-category-pill'>{activeCategory.label}</span>
                      <span className='community-author'>
                        {article.memberData?.memberNick ?? 'Community Member'}
                      </span>
                    </div>
                    <h3>{article.articleTitle}</h3>
                    <p>{article.articleContent}</p>
                    <div className='community-card-footer'>
                      <span>{formatDate(article.createdAt)}</span>
                      <div className='community-stats'>
                        <span>
                          <VisibilityOutlinedIcon />
                          {article.articleViews}
                        </span>
                        <span>
                          <FavoriteBorderOutlinedIcon />
                          {article.articleLikes}
                        </span>
                        <span>
                          <ChatBubbleOutlineOutlinedIcon />
                          {article.articleComments}
                        </span>
                      </div>
                    </div>
                  </div>
                </Box>
              ))}
            </Box>
          )}

          <Box className='community-pagination-wrap'>
            <div className='community-pagination'>
              <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                Prev
              </button>
              {buildPageNumbers().map((item, index) =>
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
