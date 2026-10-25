import React from 'react';
import { Stack, Box, Skeleton } from '@mui/material';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'next-i18next/pages';
import { GET_BOARD_ARTICLES } from '@/apollo/board-article/query';
import { BoardArticleCategory } from '@/libs/enums/board-article.enum';
import { toAssetUrl } from '@/libs/api';
import { formatLocaleDate } from '@/libs/utils/locale';

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
  const { t } = useTranslation('common');

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
  const guideArticles = allArticles.slice(0, 4);

  // Newest post's image behind the big card, over a dark fallback when there is none.
  const getFeatureBackground = (image?: string | null) => {
    const fallback = 'linear-gradient(135deg, #1d1f2b 0%, #2c2e7a 100%)';
    const src = toAssetUrl(image);
    return src ? `url('${src}'), ${fallback}` : fallback;
  };

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
    formatLocaleDate(date, router.locale, {
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

  return (
    <Stack className='board-articles'>
      <Stack className='hero-inner'>
        <Box
          className='guide-card'
          style={{ backgroundImage: getFeatureBackground(featuredArticle?.articleImage) }}
        >
          <Box className='guide-intro'>
            <span className='section-tag'>{t('Community')}</span>
            <h2>{t('From the community')}</h2>
            <p>{t('Notices from our team and posts from members.')}</p>
            <NextLink href='/community' className='home-btn light'>
              {t('Visit community')}
              <ArrowForwardRoundedIcon />
            </NextLink>
          </Box>

          <Stack className='guide-links'>
            {loading ? (
              [0, 1, 2].map((item) => (
                <Skeleton key={item} variant='rounded' height={84} className='guide-skeleton' />
              ))
            ) : guideArticles.length === 0 ? (
              <Box className='guide-empty'>{t('No community articles yet.')}</Box>
            ) : (
              guideArticles.map((article) => (
                <Box
                  key={article._id}
                  className='guide-link'
                  role='link'
                  tabIndex={0}
                  onClick={() => openArticle(article._id)}
                  onKeyDown={(event) => handleCardKeyDown(event, article._id)}
                >
                  <Box className='guide-link-copy'>
                    <span className='guide-link-meta'>
                      {t(getCategoryLabel(article.articleCategory))} · {formatDate(article.createdAt)}
                    </span>
                    <strong>{article.articleTitle}</strong>
                  </Box>
                  <ArrowForwardRoundedIcon className='guide-link-arrow' />
                </Box>
              ))
            )}
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};

export default BoardArticles;
