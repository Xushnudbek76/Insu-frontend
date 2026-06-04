import { ChangeEvent } from 'react';
import { Box, Stack } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useTranslation } from 'next-i18next/pages';
import type { BoardArticleCategory } from '@/libs/enums/board-article.enum';

interface CategoryOption {
  value: BoardArticleCategory;
  label: string;
}

interface MobileCommunityWritePageProps {
  category: BoardArticleCategory;
  title: string;
  content: string;
  previewUrl: string;
  fileName: string;
  submitting: boolean;
  categoryOptions: CategoryOption[];
  onCategoryChange: (value: BoardArticleCategory) => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const MobileCommunityWritePage = ({
  category,
  title,
  content,
  previewUrl,
  fileName,
  submitting,
  categoryOptions,
  onCategoryChange,
  onTitleChange,
  onContentChange,
  onFileChange,
  onCancel,
  onSubmit,
}: MobileCommunityWritePageProps) => (
  <MobileCommunityWriteContent
    category={category}
    title={title}
    content={content}
    previewUrl={previewUrl}
    fileName={fileName}
    submitting={submitting}
    categoryOptions={categoryOptions}
    onCategoryChange={onCategoryChange}
    onTitleChange={onTitleChange}
    onContentChange={onContentChange}
    onFileChange={onFileChange}
    onCancel={onCancel}
    onSubmit={onSubmit}
  />
);

const MobileCommunityWriteContent = ({
  category,
  title,
  content,
  previewUrl,
  fileName,
  submitting,
  categoryOptions,
  onCategoryChange,
  onTitleChange,
  onContentChange,
  onFileChange,
  onCancel,
  onSubmit,
}: MobileCommunityWritePageProps) => {
  const { t } = useTranslation('common');

  return (
    <Stack className='mobile-community-write-page'>
    <Stack className='mobile-page-hero'>
      <span>{t('Community Writing')}</span>
      <h1>{t('Share something useful')}</h1>
      <p>{t('Publish a quick update, question, review, or notice from your phone.')}</p>
    </Stack>

    <Stack className='mobile-community-write-form'>
      <label>
        <span>{t('Category')}</span>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value as BoardArticleCategory)}>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>{t('Title')}</span>
        <input value={title} maxLength={50} onChange={(event) => onTitleChange(event.target.value)} placeholder={t('Write a concise title')} />
      </label>

      <label>
        <span>{t('Content')}</span>
        <textarea
          value={content}
          maxLength={250}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder={t('Share your update, idea, or recommendation')}
        />
      </label>

      <label className='mobile-upload-box'>
        <span>{t('Cover Image')}</span>
        <div>
          <CloudUploadOutlinedIcon />
          <strong>{fileName || t('Upload a community image')}</strong>
          <small>{t('PNG, JPG, WEBP, or GIF')}</small>
        </div>
        <input type='file' accept='image/*' onChange={onFileChange} />
      </label>

      {previewUrl ? (
        <Box className='mobile-community-preview'>
          <img src={previewUrl} alt={t('Selected preview')} />
        </Box>
      ) : null}

      <Stack className='mobile-community-write-actions'>
        <button className='ghost' onClick={onCancel}>
          {t('Cancel')}
        </button>
        <button onClick={onSubmit} disabled={submitting}>
          {submitting ? t('Publishing...') : t('Publish Post')}
        </button>
      </Stack>
    </Stack>
    </Stack>
  );
};

export default MobileCommunityWritePage;
