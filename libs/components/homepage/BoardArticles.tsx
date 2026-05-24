import React from 'react';
import { Stack, Box, Typography, Skeleton } from '@mui/material';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/router';
import { GET_BOARD_ARTICLES } from '@/apollo/board-article/query';
import { BoardArticleCategory } from '@/libs/enums/board-article.enum';
import { toAssetUrl } from '@/libs/api';

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
  };
}

const BoardArticles: React.FC = () => {
  const router = useRouter();

  const { data: noticeData, loading: noticeLoading } = useQuery<GetBoardArticlesResponse>(
    GET_BOARD_ARTICLES,
    {
      variables: {
        input: {
          page: 1,
          limit: 4,
          sort: 'createdAt',
          direction: 'DESC',
          search: { articleCategory: BoardArticleCategory.NOTICE },
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const { data: freeData, loading: freeLoading } = useQuery<GetBoardArticlesResponse>(
    GET_BOARD_ARTICLES,
    {
      variables: {
        input: {
          page: 1,
          limit: 4,
          sort: 'createdAt',
          direction: 'DESC',
          search: { articleCategory: BoardArticleCategory.FREE },
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const noticeArticles = noticeData?.getBoardArticles?.list ?? [];
  const freeArticles = freeData?.getBoardArticles?.list ?? [];
  const loading = noticeLoading || freeLoading;
  const allArticles = [...noticeArticles, ...freeArticles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const featuredArticle = allArticles[0];
  const sideArticles = allArticles.slice(1, 3);
  const latestArticles = allArticles.slice(0, 5);

  const getArticleImage = (image?: string | null) =>
    toAssetUrl(image) ?? '/img/placeholder-article.svg';

  const getCategoryLabel = (category: BoardArticleCategory) => {
    const labels: Record<BoardArticleCategory, string> = {
      [BoardArticleCategory.NOTICE]: 'News',
      [BoardArticleCategory.FREE]: 'Free',
      [BoardArticleCategory.NEWS]: 'News',
      [BoardArticleCategory.REVIEW]: 'Review',
    };
    return labels[category] ?? category;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const openArticle = (articleId: string) => router.push(`/community/${articleId}`);

  const handleCardKeyDown = (event: React.KeyboardEvent, articleId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openArticle(articleId);
    }
  };

  const SkeletonBlock = ({ variant = 'side' }: { variant?: 'side' | 'feature' | 'latest' }) => (
    <Box className={`magazine-card skeleton ${variant}`}>
      <Box className='magazine-image'>
        <Skeleton variant='rectangular' width='100%' height='100%' />
      </Box>
      <Box className='magazine-copy'>
        <Skeleton variant='text' sx={{ fontSize: '12px', width: '34%' }} />
        <Skeleton variant='text' sx={{ fontSize: variant === 'feature' ? '34px' : '18px' }} />
        <Skeleton variant='text' sx={{ fontSize: '13px', width: '58%' }} />
      </Box>
    </Box>
  );

  const renderSideArticle = (article: BoardArticleData) => (
    <Box
      key={article._id}
      className='magazine-card side'
      onClick={() => openArticle(article._id)}
      role='button'
      tabIndex={0}
      onKeyDown={(event) => handleCardKeyDown(event, article._id)}
    >
      <Box className='magazine-image'>
        <Box
          className='article-image'
          style={{ backgroundImage: `url(${getArticleImage(article.articleImage)})` }}
        />
      </Box>
      <Box className='magazine-copy'>
        <span className='article-category'>{getCategoryLabel(article.articleCategory)}</span>
        <Typography className='article-title'>{article.articleTitle}</Typography>
        <small>{formatDate(article.createdAt)}</small>
      </Box>
    </Box>
  );

  const renderFeatureArticle = (article: BoardArticleData) => (
    <Box
      className='magazine-card feature'
      onClick={() => openArticle(article._id)}
      role='button'
      tabIndex={0}
      onKeyDown={(event) => handleCardKeyDown(event, article._id)}
    >
      <Box className='magazine-image'>
        <Box
          className='article-image'
          style={{ backgroundImage: `url(${getArticleImage(article.articleImage)})` }}
        />
      </Box>
      <Box className='magazine-copy'>
        <span className='article-category'>{getCategoryLabel(article.articleCategory)}</span>
        <Typography className='article-title'>{article.articleTitle}</Typography>
        <Typography className='article-excerpt'>{article.articleContent}</Typography>
        <small>
          {formatDate(article.createdAt)}
          {article.memberData?.memberNick ? ` · ${article.memberData.memberNick}` : ''}
        </small>
      </Box>
    </Box>
  );

  const renderLatestArticle = (article: BoardArticleData) => (
    <Box
      key={article._id}
      className='latest-item'
      onClick={() => openArticle(article._id)}
      role='button'
      tabIndex={0}
      onKeyDown={(event) => handleCardKeyDown(event, article._id)}
    >
      <Box className='latest-copy'>
        <Typography>{article.articleTitle}</Typography>
        <small>{formatDate(article.createdAt)}</small>
      </Box>
      <Box
        className='latest-thumb'
        style={{ backgroundImage: `url(${getArticleImage(article.articleImage)})` }}
      />
    </Box>
  );

  return (
    <Stack className='board-articles'>
      <Stack className='hero-inner'>
        {loading ? (
          <Box className='article-magazine'>
            <Stack className='side-column'>
              <SkeletonBlock />
              <SkeletonBlock />
            </Stack>
            <SkeletonBlock variant='feature' />
            <Stack className='latest-column'>
              <h3>Latest</h3>
              {[0, 1, 2, 3, 4].map((item) => (
                <SkeletonBlock key={item} variant='latest' />
              ))}
            </Stack>
          </Box>
        ) : allArticles.length === 0 ? (
          <Box className='articles-empty'>No community articles yet.</Box>
        ) : (
          <Box className='article-magazine'>
            <Stack className='side-column'>
              {sideArticles.map((article) => renderSideArticle(article))}
            </Stack>
            {featuredArticle && renderFeatureArticle(featuredArticle)}
            <Stack className='latest-column'>
              <h3>Latest</h3>
              {latestArticles.map((article) => renderLatestArticle(article))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

export default BoardArticles;
