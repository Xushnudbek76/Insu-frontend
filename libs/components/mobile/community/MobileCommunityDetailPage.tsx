import { Avatar, Box, Stack } from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import type { BoardArticleCategory } from '@/libs/enums/board-article.enum';

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
  categoryLabel,
  getArticleImage,
  formatDate,
  onCommentTextChange,
  onBack,
  onLike,
  onPostComment,
}: MobileCommunityDetailPageProps) => (
  <Stack className='mobile-community-detail-page'>
    <button className='mobile-back-btn' onClick={onBack}>
      <ArrowBackOutlinedIcon />
      Back to community
    </button>

    <Box
      className='mobile-community-detail-hero'
      style={{ backgroundImage: `linear-gradient(rgba(8, 13, 20, 0.2), rgba(8, 13, 20, 0.58)), url(${getArticleImage(article.articleImage)})` }}
    >
      <span>{categoryLabel}</span>
      <h1>{article.articleTitle}</h1>
      <small>{formatDate(article.createdAt)}</small>
    </Box>

    <Stack className='mobile-community-detail-card'>
      <Stack className='mobile-community-author'>
        <Avatar src={article.memberData?.memberImage ?? undefined}>
          {article.memberData?.memberNick?.[0] ?? 'U'}
        </Avatar>
        <div>
          <strong>{article.memberData?.memberNick ?? 'Community Member'}</strong>
          <span>Shared with the INSU community</span>
        </div>
      </Stack>

      <p>{article.articleContent}</p>

      <Stack className='mobile-community-stats'>
        <span>
          <VisibilityOutlinedIcon />
          {article.articleViews}
        </span>
        <button onClick={onLike}>
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          {article.articleLikes}
        </button>
        <span>
          <ChatBubbleOutlineOutlinedIcon />
          {commentTotal}
        </span>
      </Stack>
    </Stack>

    <Stack className='mobile-community-comments'>
      <h2>Comments ({commentTotal})</h2>
      <textarea
        value={commentText}
        onChange={(event) => onCommentTextChange(event.target.value)}
        placeholder='Share your thoughts about this post'
      />
      <button disabled={postingComment || !commentText.trim()} onClick={onPostComment}>
        {postingComment ? 'Posting...' : 'Post Comment'}
      </button>

      {comments.length === 0 ? (
        <div className='mobile-comment-empty'>No comments yet. Start the conversation.</div>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className='mobile-comment-item'>
            <Avatar src={comment.memberData?.memberImage ?? undefined}>
              {comment.memberData?.memberNick?.[0] ?? 'U'}
            </Avatar>
            <div>
              <strong>{comment.memberData?.memberNick ?? 'Member'}</strong>
              <span>{formatDate(comment.createdAt)}</span>
              <p>{comment.commentContent}</p>
            </div>
          </div>
        ))
      )}
    </Stack>
  </Stack>
);

export default MobileCommunityDetailPage;
