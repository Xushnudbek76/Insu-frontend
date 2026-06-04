import { useState } from 'react';
import { Box, Avatar } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'next-i18next/pages';
import { userVar } from '@/apollo/store';
import { CREATE_COMMENT } from '@/apollo/comment/mutation';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
import { getMemberImage, timeAgo } from './helpers';
import type { Comment } from './types';

interface PackageCommentsProps {
  packageId: string;
  comments: Comment[];
  commentTotal: number;
  onCommentAdded: (comment: Comment) => void;
}

const PackageComments = ({
  packageId,
  comments,
  commentTotal,
  onCommentAdded,
}: PackageCommentsProps) => {
  const { t } = useTranslation('common');
  const [commentText, setCommentText] = useState('');
  const [createComment, { loading: postingComment }] = useMutation<{
    createComment: Comment;
  }>(CREATE_COMMENT);

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert(t('Please login to comment.'));
      return;
    }

    try {
      const res = await createComment({
        variables: {
          input: {
            commentContent: commentText.trim(),
            commentRefId: packageId,
            commentGroup: 'PACKAGE',
          },
        },
      });
      const newComment = res.data?.createComment;
      if (newComment) {
        onCommentAdded(newComment);
        setCommentText('');
        await sweetTopSuccessAlert(t('Comment posted!'));
      }
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message ?? t('Could not post comment.')
      );
    }
  };

  return (
    <Box component={'section'} className={'pd-comments'}>
      <Box className={'pd-comments-header'}>
        <h2 className={'pd-section-title'}>{t('User Comments')}</h2>
        <span className={'pd-comment-count'}>{commentTotal}</span>
      </Box>

      <Box className={'pd-comment-form'}>
        <textarea
          className={'pd-comment-input'}
          placeholder={t('Share your experience with this plan...')}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={4}
        />
        <Box className={'pd-comment-form-footer'}>
          <button
            className={'pd-post-btn'}
            onClick={handlePostComment}
            disabled={postingComment || !commentText.trim()}
          >
            {postingComment ? t('Posting...') : t('Post Comment')}
          </button>
        </Box>
      </Box>

      <Box className={'pd-comments-list'}>
        {comments.length === 0 ? (
          <p className={'pd-no-comments'}>{t('No comments yet. Be the first!')}</p>
        ) : (
          comments.map((c) => (
            <Box key={c._id} className={'pd-comment-item'}>
              <Avatar
                src={getMemberImage(c.memberData?.memberImage)}
                sx={{ width: 40, height: 40, flexShrink: 0 }}
              />
              <Box className={'pd-comment-body'}>
                <Box className={'pd-comment-meta'}>
                  <span className={'pd-comment-nick'}>
                    {c.memberData?.memberNick ?? t('Member')}
                  </span>
                  <span className={'pd-comment-time'}>{timeAgo(c.createdAt)}</span>
                </Box>
                <p className={'pd-comment-text'}>{c.commentContent}</p>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default PackageComments;
