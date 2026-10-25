import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Avatar, Box, Stack } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import withLayoutMain from '@/layout/LayoutHome';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { getMeLiked, useSingleLikeToggle } from '@/libs/hooks/useLikeToggle';
import { GET_BOARD_ARTICLE } from '@/apollo/board-article/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '@/apollo/board-article/mutation';
import { GET_COMMENTS } from '@/apollo/comment/query';
import { CREATE_COMMENT } from '@/apollo/comment/mutation';
import { userVar } from '@/apollo/store';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
import { BoardArticleCategory } from '@/libs/enums/board-article.enum';
import { toAssetUrl } from '@/libs/api';
import MobileCommunityDetailPage from '@/libs/components/mobile/community/MobileCommunityDetailPage';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useTranslation } from 'next-i18next/pages';
import { formatLocaleDate } from '@/libs/utils/locale';

export const getServerSideProps = async ({ locale = 'en' }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

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
  const { t } = useTranslation('common');
  const device = useDeviceDetect();
  const { id } = router.query;
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const articleId = typeof id === 'string' ? id : undefined;

  const {
    loading: articleLoading,
    data: articleData,
    error: articleError,
    refetch: refetchArticle,
  } = useQuery<{ getBoardArticle: BoardArticleData }>(GET_BOARD_ARTICLE, {
    skip: !articleId,
    fetchPolicy: 'no-cache',
    variables: { articleId },
  });

  const {
    loading: commentsLoading,
    data: commentsData,
    refetch: refetchComments,
  } = useQuery<{ getComments: { list: CommentData[]; metaCounter: { total: number }[] } }>(
    GET_COMMENTS,
    {
      skip: !articleId,
      fetchPolicy: 'no-cache',
      variables: {
        input: {
          page: 1,
          limit: 20,
          sort: 'createdAt',
          direction: 'DESC',
          search: { commentRefId: articleId },
        },
      },
    },
  );

  const [likeTargetBoardArticle] = useMutation<{
    likeTargetBoardArticle: { _id: string; articleLikes: number };
  }>(LIKE_TARGET_BOARD_ARTICLE);

  const [createComment] = useMutation<{ createComment: CommentData }>(CREATE_COMMENT);

  const loading = articleLoading || commentsLoading;
  const article = articleData?.getBoardArticle ?? null;
  const comments = commentsData?.getComments.list ?? [];
  const commentTotal = commentsData?.getComments.metaCounter?.[0]?.total ?? 0;

  const getArticleImage = (image?: string | null) =>
    toAssetUrl(image) ?? '/img/placeholder-article.svg';

  // Undefined lets MUI Avatar fall back to the member's initial.
  const getAvatar = (image?: string | null) => toAssetUrl(image);

  const formatDate = (date: string) =>
    formatLocaleDate(date, router.locale, {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const articleLike = useSingleLikeToggle({
    sourceState: {
      liked: getMeLiked(article?.meLiked),
      count: article?.articleLikes ?? 0,
    },
    isAuthenticated: () => Boolean(userVar()?._id),
    onUnauthenticated: () => sweetMixinErrorAlert(t('Please login to like posts.')),
    mutate: async (optimistic) => {
      if (!articleId) return optimistic;

      const result = await likeTargetBoardArticle({
        variables: { articleId },
      });
      const updated = result.data?.likeTargetBoardArticle;
      if (!updated) return optimistic;

      return {
        liked: optimistic.liked,
        count: updated.articleLikes,
      };
    },
    onError: (message) => sweetMixinErrorAlert(message),
    errorMessage: t('Could not update likes.'),
  });

  const handlePostComment = async () => {
    if (!article || !commentText.trim()) return;

    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert(t('Please login to comment.'));
      return;
    }

    try {
      setPostingComment(true);
      const res = await createComment({
        variables: {
          input: {
            commentGroup: 'ARTICLE',
            commentContent: commentText.trim(),
            commentRefId: article._id,
          },
        },
      });

      if (!res.data?.createComment) return;

      setCommentText('');
      await Promise.all([refetchArticle(), refetchComments()]);
      await sweetTopSuccessAlert(t('Comment posted.'));
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message ?? t('Could not post comment.'),
      );
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <Stack className='community-detail-page'>
        <div className='post-detail-state'>{t('Loading community post...')}</div>
      </Stack>
    );
  }

  if (articleError || !article) {
    return (
      <Stack className='community-detail-page'>
        <div className='post-detail-state'>
          <p>{t('This post could not be found.')}</p>
          <button type='button' onClick={() => router.push('/community')}>
            {t('Back to Community')}
          </button>
        </div>
      </Stack>
    );
  }
  if (device === 'mobile') {
    return (
      <MobileCommunityDetailPage
        article={article}
        comments={comments}
        commentText={commentText}
        commentTotal={commentTotal}
        postingComment={postingComment}
        liked={articleLike.liked}
        likeCount={articleLike.count}
        categoryLabel={t(CATEGORY_LABEL[article.articleCategory])}
        getArticleImage={getArticleImage}
        formatDate={formatDate}
        onCommentTextChange={setCommentText}
        onBack={() => router.push('/community')}
        onLike={articleLike.toggle}
        onPostComment={handlePostComment}
      />
    );
  }

  const authorName = article.memberData?.memberNick ?? t('Community Member');
  const imageSrc = toAssetUrl(article.articleImage);

  return (
    <Stack className='community-detail-page'>
      <Box component='article' className='post-detail'>
        <button type='button' className='post-detail-back' onClick={() => router.push('/community')}>
          <ArrowBackRoundedIcon />
          {t('Back to Community')}
        </button>

        <header className='post-detail-header'>
          <div className='post-detail-meta'>
            <span className='post-detail-category'>{t(CATEGORY_LABEL[article.articleCategory])}</span>
            <span>{formatDate(article.createdAt)}</span>
          </div>
          <h1>{article.articleTitle}</h1>
          <div className='post-detail-byline'>
            <Avatar src={getAvatar(article.memberData?.memberImage)} alt={authorName}>
              {authorName[0]}
            </Avatar>
            <div className='post-detail-author'>
              <strong>{authorName}</strong>
              <span>{t('Shared with the INSU community')}</span>
            </div>
            <button
              type='button'
              className={`post-detail-like${articleLike.liked ? ' liked' : ''}`}
              aria-pressed={articleLike.liked}
              onClick={articleLike.toggle}
            >
              {articleLike.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              {articleLike.count}
            </button>
          </div>
        </header>

        {imageSrc && !imageFailed && (
          <figure className='post-detail-image'>
            <img src={imageSrc} alt={article.articleTitle} onError={() => setImageFailed(true)} />
          </figure>
        )}

        <div className='post-detail-content'>{article.articleContent}</div>

        <div className='post-detail-stats'>
          <span>
            <VisibilityOutlinedIcon />
            {article.articleViews} {t('views')}
          </span>
          <span>
            <FavoriteBorderIcon />
            {articleLike.count} {t('likes')}
          </span>
          <span>
            <ChatBubbleOutlineOutlinedIcon />
            {commentTotal} {t('comments')}
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
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={t('Share your thoughts about this post')}
            />
            <button
              type='button'
              disabled={postingComment || !commentText.trim()}
              onClick={handlePostComment}
            >
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
                    <Avatar src={getAvatar(comment.memberData?.memberImage)} alt={name}>
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

export default withLayoutMain(CommunityDetailPage);
