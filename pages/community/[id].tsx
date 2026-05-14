import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import withLayoutMain from '@/layout/LayoutHome';
import { initializeApollo } from '@/apollo/client';
import { GET_BOARD_ARTICLE } from '@/apollo/board-article/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '@/apollo/board-article/mutation';
import { GET_COMMENTS } from '@/apollo/comment/query';
import { CREATE_COMMENT } from '@/apollo/comment/mutation';
import { userVar } from '@/apollo/store';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
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
  articleStatus?: string;
  articleTitle: string;
  articleContent: string;
  articleImage?: string | null;
  articleViews: number;
  articleLikes: number;
  articleComments: number;
  createdAt: string;
  updatedAt: string;
  memberData?: ArticleMember | null;
  meLiked?: { myFavorite: boolean }[] | null;
}

interface CommentData {
  _id: string;
  commentContent: string;
  createdAt: string;
  memberData?: ArticleMember | null;
}

const CATEGORY_LABEL: Record<BoardArticleCategory, string> = {
  [BoardArticleCategory.FREE]: 'Free',
  [BoardArticleCategory.NOTICE]: 'Notice',
  [BoardArticleCategory.NEWS]: 'News',
  [BoardArticleCategory.REVIEW]: 'Reviews',
};

const CommunityDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<BoardArticleData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    const client = initializeApollo(null);
    setLoading(true);

    Promise.all([
      client.query<{ getBoardArticle: BoardArticleData }>({
        query: GET_BOARD_ARTICLE,
        variables: { articleId: id },
        fetchPolicy: 'no-cache',
      }),
      client.query<{ getComments: { list: CommentData[]; metaCounter: { total: number }[] } }>({
        query: GET_COMMENTS,
        variables: {
          input: {
            page: 1,
            limit: 20,
            sort: 'createdAt',
            direction: 'DESC',
            search: { commentRefId: id },
          },
        },
        fetchPolicy: 'no-cache',
      }),
    ])
      .then(([articleRes, commentsRes]) => {
        setArticle(articleRes.data.getBoardArticle);
        setComments(commentsRes.data.getComments.list || []);
        setCommentTotal(commentsRes.data.getComments.metaCounter?.[0]?.total ?? 0);
      })
      .catch((err) => {
        console.error('community detail error', err);
        setArticle(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getArticleImage = (image?: string | null) =>
    toAssetUrl(image) ?? '/img/placeholder-article.svg';

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleToggleLike = async () => {
    if (!article) return;

    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert('Please login to like posts.');
      return;
    }

    const wasLiked = article.meLiked?.[0]?.myFavorite ?? false;

    try {
      const client = initializeApollo(null);
      const res = await client.mutate<{ likeTargetBoardArticle: { _id: string; articleLikes: number } }>({
        mutation: LIKE_TARGET_BOARD_ARTICLE,
        variables: { articleId: article._id },
      });

      setArticle((prev) =>
        prev
          ? {
              ...prev,
              articleLikes: res.data?.likeTargetBoardArticle.articleLikes ?? prev.articleLikes,
              meLiked: [{ myFavorite: !wasLiked }],
            }
          : prev,
      );
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message ?? 'Could not update likes.',
      );
    }
  };

  const handlePostComment = async () => {
    if (!article || !commentText.trim()) return;

    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert('Please login to comment.');
      return;
    }

    try {
      setPostingComment(true);
      const client = initializeApollo(null);
      const res = await client.mutate<{ createComment: CommentData }>({
        mutation: CREATE_COMMENT,
        variables: {
          input: {
            commentGroup: 'ARTICLE',
            commentContent: commentText.trim(),
            commentRefId: article._id,
          },
        },
      });

      const created = res.data?.createComment;
      if (!created) return;

      const hydratedComment: CommentData = {
        ...created,
        memberData: {
          _id: user._id,
          memberNick: user.memberNick,
          memberImage: user.memberImage,
        },
      };

      setComments((prev) => [hydratedComment, ...prev]);
      setCommentTotal((prev) => prev + 1);
      setArticle((prev) =>
        prev ? { ...prev, articleComments: (prev.articleComments ?? 0) + 1 } : prev,
      );
      setCommentText('');
      await sweetTopSuccessAlert('Comment posted.');
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message ?? 'Could not post comment.',
      );
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <Stack className='community-detail-page'>
        <Box className='community-shell'>
          <div className='community-detail-loading'>Loading community post...</div>
        </Box>
      </Stack>
    );
  }

  if (!article) {
    return (
      <Stack className='community-detail-page'>
        <Box className='community-shell'>
          <div className='community-detail-empty'>This post could not be found.</div>
        </Box>
      </Stack>
    );
  }

  const liked = article.meLiked?.[0]?.myFavorite ?? false;

  return (
    <Stack className='community-detail-page'>
      <Box className='community-shell'>
        <button className='community-back-btn' onClick={() => router.push('/community')}>
          <ArrowBackOutlinedIcon />
          Back to Community
        </button>

        <Box className='community-detail-card'>
          <div
            className='community-detail-hero'
            style={{ backgroundImage: `url(${getArticleImage(article.articleImage)})` }}
          />

          <div className='community-detail-body'>
            <div className='community-detail-meta-top'>
              <span className='community-category-pill'>{CATEGORY_LABEL[article.articleCategory]}</span>
              <span>{formatDate(article.createdAt)}</span>
            </div>

            <h1>{article.articleTitle}</h1>

            <div className='community-detail-author'>
              <Avatar src={article.memberData?.memberImage ?? undefined}>
                {article.memberData?.memberNick?.[0] ?? 'U'}
              </Avatar>
              <div>
                <strong>{article.memberData?.memberNick ?? 'Community Member'}</strong>
                <span>Shared with the INSU community</span>
              </div>
            </div>

            <p className='community-detail-content'>{article.articleContent}</p>

            <div className='community-detail-stats'>
              <span>
                <VisibilityOutlinedIcon />
                {article.articleViews} views
              </span>
              <button className={liked ? 'liked' : ''} onClick={handleToggleLike}>
                {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                {article.articleLikes} likes
              </button>
              <span>
                <ChatBubbleOutlineOutlinedIcon />
                {commentTotal} comments
              </span>
            </div>
          </div>
        </Box>

        <Box className='community-comments-card'>
          <div className='community-comments-header'>
            <h2>Comments</h2>
            <span>{commentTotal}</span>
          </div>

          <div className='community-comment-form'>
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder='Share your thoughts about this post'
            />
            <button disabled={postingComment || !commentText.trim()} onClick={handlePostComment}>
              {postingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>

          <div className='community-comment-list'>
            {comments.length === 0 ? (
              <div className='community-comment-empty'>No comments yet. Start the conversation.</div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className='community-comment-item'>
                  <Avatar src={comment.memberData?.memberImage ?? undefined}>
                    {comment.memberData?.memberNick?.[0] ?? 'U'}
                  </Avatar>
                  <div className='community-comment-body'>
                    <div className='community-comment-head'>
                      <strong>{comment.memberData?.memberNick ?? 'Member'}</strong>
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                    <p>{comment.commentContent}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Box>
      </Box>
    </Stack>
  );
};

export default withLayoutMain(CommunityDetailPage);
