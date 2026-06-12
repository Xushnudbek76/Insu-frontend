import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { Box, Stack } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { useTranslation } from 'next-i18next/pages';
import type { BoardArticleCategory } from '@/libs/enums/board-article.enum';
import { buildPageNumbers } from '@/libs/utils/pagination';
import type { LikeState } from '@/libs/types/common';

interface CategoryConfigItem {
  value: BoardArticleCategory;
  label: string;
  description: string;
}

interface ArticleMember {
  _id: string;
  memberNick?: string | null;
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

interface MobileCommunityPageProps {
  category: BoardArticleCategory;
  searchText: string;
  sort: string;
  page: number;
  totalPages: number;
  activeCategory: CategoryConfigItem;
  categories: CategoryConfigItem[];
  articles: BoardArticleData[];
  total: number;
  loading: boolean;
  sortOptions: { value: string; label: string }[];
  getArticleImage: (image?: string | null) => string;
  formatDate: (date: string) => string;
  articleLikeStates: Record<string, LikeState>;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSearchSubmit: () => void;
  onCategoryChange: (value: BoardArticleCategory) => void;
  onSortChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onOpenWrite: () => void;
  onOpenArticle: (id: string) => void;
  onToggleArticleLike: (event: MouseEvent, id: string) => void;
}

const MobileCommunityPage = ({
  category,
  searchText,
  sort,
  page,
  totalPages,
  activeCategory,
  categories,
  articles,
  total,
  loading,
  sortOptions,
  getArticleImage,
  formatDate,
  articleLikeStates,
  onSearchChange,
  onSearchKeyDown,
  onSearchSubmit,
  onCategoryChange,
  onSortChange,
  onPageChange,
  onOpenWrite,
  onOpenArticle,
  onToggleArticleLike,
}: MobileCommunityPageProps) => (
  <MobileCommunityContent
    category={category}
    searchText={searchText}
    sort={sort}
    page={page}
    totalPages={totalPages}
    activeCategory={activeCategory}
    categories={categories}
    articles={articles}
    total={total}
    loading={loading}
    sortOptions={sortOptions}
    getArticleImage={getArticleImage}
    formatDate={formatDate}
    articleLikeStates={articleLikeStates}
    onSearchChange={onSearchChange}
    onSearchKeyDown={onSearchKeyDown}
    onSearchSubmit={onSearchSubmit}
    onCategoryChange={onCategoryChange}
    onSortChange={onSortChange}
    onPageChange={onPageChange}
    onOpenWrite={onOpenWrite}
    onOpenArticle={onOpenArticle}
    onToggleArticleLike={onToggleArticleLike}
  />
);

const MobileCommunityContent = ({
  category,
  searchText,
  sort,
  page,
  totalPages,
  activeCategory,
  categories,
  articles,
  total,
  loading,
  sortOptions,
  getArticleImage,
  formatDate,
  articleLikeStates,
  onSearchChange,
  onSearchKeyDown,
  onSearchSubmit,
  onCategoryChange,
  onSortChange,
  onPageChange,
  onOpenWrite,
  onOpenArticle,
  onToggleArticleLike,
}: MobileCommunityPageProps) => {
  const { t } = useTranslation('common');

  return (
    <Stack className='mobile-community-page'>
    <Stack className='mobile-page-hero'>
      <span>{t('Community')}</span>
      <h1>{t('{{category}} board', { category: t(activeCategory.label) })}</h1>
      <p>{t(activeCategory.description)}</p>
    </Stack>

    <button className='mobile-create-btn' onClick={onOpenWrite}>
      <AddOutlinedIcon />
      {t('Create Post')}
    </button>

    <Box className='mobile-category-scroll'>
      {categories.map((item) => (
        <button
          key={item.value}
          className={item.value === category ? 'active' : ''}
          onClick={() => onCategoryChange(item.value)}
        >
          {t(item.label)}
        </button>
      ))}
    </Box>

    <Stack className='mobile-community-filters'>
      <div className='mobile-search-box'>
        <SearchOutlinedIcon />
        <input
          type='text'
          value={searchText}
          placeholder={t('Search posts')}
          onChange={onSearchChange}
          onKeyDown={onSearchKeyDown}
        />
        <button onClick={onSearchSubmit}>{t('Go')}</button>
      </div>
      <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
    </Stack>

    <span className='mobile-community-total'>{t('posts count', { count: total })}</span>

    {loading ? (
      <Box className='mobile-community-list'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Box key={index} className='mobile-community-card skeleton' />
        ))}
      </Box>
    ) : articles.length === 0 ? (
      <Stack className='mobile-empty-card'>
        <h2>{t('No posts found')}</h2>
        <p>{t('Try changing the category or search terms.')}</p>
      </Stack>
    ) : (
      <Box className='mobile-community-list'>
        {articles.map((article) => {
          const likeState = articleLikeStates[article._id] ?? {
            liked: article.meLiked?.[0]?.myFavorite === true,
            count: article.articleLikes,
          };

          return (
            <Stack
              key={article._id}
              className='mobile-community-card'
              onClick={() => onOpenArticle(article._id)}
            >
              <Box
                className='mobile-community-image'
                style={{ backgroundImage: `url(${getArticleImage(article.articleImage)})` }}
              />
              <Stack className='mobile-community-body'>
                <div className='mobile-community-meta'>
                  <span>{t(article.articleCategory)}</span>
                  <small>{formatDate(article.createdAt)}</small>
                </div>
                <h3>{article.articleTitle}</h3>
                <p>{article.articleContent}</p>
                <strong>{article.memberData?.memberNick ?? t('Community Member')}</strong>
                <Stack
                  className='mobile-community-stats'
                  onClick={(event) => event.stopPropagation()}
                >
                  <span>
                    <VisibilityOutlinedIcon />
                    {article.articleViews}
                  </span>
                  <button
                    type='button'
                    className={likeState.liked ? 'liked' : ''}
                    onClick={(event) => onToggleArticleLike(event, article._id)}
                  >
                    {likeState.liked ? <FavoriteIcon /> : <FavoriteBorderOutlinedIcon />}
                    {likeState.count}
                  </button>
                  <span>
                    <ChatBubbleOutlineOutlinedIcon />
                    {article.articleComments}
                  </span>
                </Stack>
              </Stack>
            </Stack>
          );
        })}
      </Box>
    )}

    {totalPages > 1 && (
      <Box className='mobile-pagination'>
        {buildPageNumbers(page, totalPages).map((pageNumber, index) =>
          pageNumber === '...' ? (
            <span key={`community-dots-${index}`}>…</span>
          ) : (
            <button
              key={pageNumber}
              className={page === pageNumber ? 'active' : ''}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ),
        )}
      </Box>
    )}
    </Stack>
  );
};

export default MobileCommunityPage;
