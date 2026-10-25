import { useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { useTranslation } from 'next-i18next/pages';
import type { BoardArticleCategory } from '@/libs/enums/board-article.enum';
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
  createdAt: string;
  memberData?: ArticleMember | null;
  meLiked?: { myFavorite: boolean }[] | null;
}

interface CommentData {
  _id: string;
  commentContent: string;
  createdAt: string;
  memberData?: ArticleMember | null;
}

interface MobileCommunityDetailPageProps {
  article: BoardArticleData;
  comments: CommentData[];
  commentText: string;
  commentTotal: number;
  postingComment: boolean;
  liked: boolean;
  likeCount: number;
  categoryLabel: string;
  getArticleImage: (image?: string | null) => string;
  formatDate: (date: string) => string;
  onCommentTextChange: (value: string) => void;
  onBack: () => void;
  onLike: () => void;
  onPostComment: () => void;
}

const MobileCommunityDetailPage = ({
  article,
  comments,
  commentText,
  commentTotal,
  postingComment,
  liked,
  likeCount,
  categoryLabel,
  getArticleImage,
  formatDate,
  onCommentTextChange,
  onBack,
  onLike,
  onPostComment,
}: MobileCommunityDetailPageProps) => (
  <MobileCommunityDetailContent
    article={article}
    comments={comments}
    commentText={commentText}
    commentTotal={commentTotal}
    postingComment={postingComment}
    liked={liked}
    likeCount={likeCount}
    categoryLabel={categoryLabel}
    getArticleImage={getArticleImage}
    formatDate={formatDate}
    onCommentTextChange={onCommentTextChange}
    onBack={onBack}
    onLike={onLike}
    onPostComment={onPostComment}
  />
);

const MobileCommunityDetailContent = ({
  article,
  comments,
  commentText,
  commentTotal,
  postingComment,
  liked,
  likeCount,
  categoryLabel,
  getArticleImage,
  formatDate,
  onCommentTextChange,
  onBack,
  onLike,
  onPostComment,
}: MobileCommunityDetailPageProps) => {
  const { t } = useTranslation('common');
  const [imageFailed, setImageFailed] = useState(false);
  const authorName = article.memberData?.memberNick ?? t('Community Member');

  return (
    <Stack className='mobile-community-detail-page'>
      <Box component='article' className='post-detail'>
        <button type='button' className='post-detail-back' onClick={onBack}>
          <ArrowBackRoundedIcon />
          {t('Back to community')}
        </button>

        <header className='post-detail-header'>
          <div className='post-detail-meta'>
            <span className='post-detail-category'>{categoryLabel}</span>
            <span>{formatDate(article.createdAt)}</span>
          </div>
          <h1>{article.articleTitle}</h1>
          <div className='post-detail-byline'>
            <Avatar src={toAssetUrl(article.memberData?.memberImage)} alt={authorName}>
              {authorName[0]}
            </Avatar>
            <div className='post-detail-author'>
              <strong>{authorName}</strong>
              <span>{t('Shared with the INSU community')}</span>
            </div>
            <button
              type='button'
              className={`post-detail-like${liked ? ' liked' : ''}`}
              aria-pressed={liked}
              onClick={onLike}
            >
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              {likeCount}
            </button>
          </div>
        </header>

        {article.articleImage && !imageFailed && (
          <figure className='post-detail-image'>
            <img
              src={getArticleImage(article.articleImage)}
              alt={article.articleTitle}
              onError={() => setImageFailed(true)}
            />
          </figure>
        )}

        <div className='post-detail-content'>{article.articleContent}</div>

        <div className='post-detail-stats'>
          <span>
            <VisibilityOutlinedIcon />
            {article.articleViews}
          </span>
          <span>
            <FavoriteBorderIcon />
            {likeCount}
          </span>
          <span>
            <ChatBubbleOutlineOutlinedIcon />
            {commentTotal}
          </span>
        </div>

        <section className='post-comments'>
          <div className='post-comments-head'>
            <h2>{t('Comments')}</h2>
            <span>{commentTotal}</span>
          </div>

          <div className='post-comment-form'>
            <textarea
              value={commentText}
              onChange={(event) => onCommentTextChange(event.target.value)}
              placeholder={t('Share your thoughts about this post')}
            />
            <button type='button' disabled={postingComment || !commentText.trim()} onClick={onPostComment}>
              {postingComment ? t('Posting...') : t('Post Comment')}
            </button>
          </div>

          {comments.length === 0 ? (
            <p className='post-comment-empty'>{t('No comments yet. Start the conversation.')}</p>
          ) : (
            <div className='post-comment-list'>
              {comments.map((comment) => {
                const name = comment.memberData?.memberNick ?? t('Member');
                return (
                  <div key={comment._id} className='post-comment'>
                    <Avatar src={toAssetUrl(comment.memberData?.memberImage)} alt={name}>
                      {name[0]}
                    </Avatar>
                    <div className='post-comment-body'>
                      <div className='post-comment-head'>
                        <strong>{name}</strong>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      <p>{comment.commentContent}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </Box>
    </Stack>
  );
};

export default MobileCommunityDetailPage;
