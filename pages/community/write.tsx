import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { useMutation } from '@apollo/client/react';
import { Box, Stack } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import withLayoutMain from '@/layout/LayoutHome';
import { BoardArticleCategory } from '@/libs/enums/board-article.enum';
import { userVar } from '@/apollo/store';
import { CREATE_BOARD_ARTICLE } from '@/apollo/board-article/mutation';
import { IMAGE_UPLOADER_MUTATION } from '@/apollo/member/mutation';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';

const CATEGORY_OPTIONS = [
  { value: BoardArticleCategory.FREE, label: 'Free' },
  { value: BoardArticleCategory.NOTICE, label: 'Notice' },
  { value: BoardArticleCategory.NEWS, label: 'News' },
  { value: BoardArticleCategory.REVIEW, label: 'Reviews' },
];

const CommunityWritePage: NextPage = () => {
  const router = useRouter();
  const user = userVar();
  const [category, setCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

  const [uploadImage] = useMutation<{ imageUploader: string }>(IMAGE_UPLOADER_MUTATION);
  const [createBoardArticle] = useMutation<{ createBoardArticle: { _id: string } }>(
    CREATE_BOARD_ARTICLE,
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!user?._id) {
      await sweetMixinErrorAlert('Please login before writing a post.');
      router.push('/account/join');
      return;
    }

    if (title.trim().length < 3 || content.trim().length < 3) {
      await sweetMixinErrorAlert('Title and content must be at least 3 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      let articleImage: string | undefined;

      if (file) {
        const uploadRes = await uploadImage({
          variables: {
            file,
            target: 'community',
          },
        });
        articleImage = uploadRes.data?.imageUploader;
      }

      const res = await createBoardArticle({
        variables: {
          input: {
            articleCategory: category,
            articleTitle: title.trim(),
            articleContent: content.trim(),
            ...(articleImage ? { articleImage } : {}),
          },
        },
      });

      const createdId = res.data?.createBoardArticle._id;
      if (!createdId) {
        throw new Error('Article was not created');
      }

      await sweetTopSuccessAlert('Community post created.');
      router.push(`/community/${createdId}`);
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Could not create post.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack className='community-write-page'>
      <Box className='community-shell'>
        <Box className='community-write-card'>
          <div className='community-write-header'>
            <span>Create a Community Post</span>
            <h1>Share something useful with the INSU community</h1>
            <p>
              Publish updates, questions, recommendations, or insights in the channel that fits
              best.
            </p>
          </div>

          <div className='community-write-grid'>
            <label>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as BoardArticleCategory)}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className='full'>
              <span>Title</span>
              <input
                type='text'
                value={title}
                maxLength={50}
                onChange={(event) => setTitle(event.target.value)}
                placeholder='Write a concise title'
              />
            </label>

            <label className='full'>
              <span>Content</span>
              <textarea
                value={content}
                maxLength={250}
                onChange={(event) => setContent(event.target.value)}
                placeholder='Share your update, idea, or recommendation'
              />
            </label>

            <label className='full community-upload-field'>
              <span>Cover Image</span>
              <div className='community-upload-box'>
                <CloudUploadOutlinedIcon />
                <strong>{file ? file.name : 'Upload a community image'}</strong>
                <small>PNG, JPG, WEBP, or GIF. Leave empty to use the default image.</small>
                <input type='file' accept='image/*' onChange={handleFileChange} />
              </div>
            </label>

            {previewUrl ? (
              <div className='community-upload-preview full'>
                <img src={previewUrl} alt='Selected preview' />
              </div>
            ) : null}
          </div>

          <div className='community-write-actions'>
            <button className='ghost' onClick={() => router.push('/community')}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </Box>
      </Box>
    </Stack>
  );
};

export default withLayoutMain(CommunityWritePage);
