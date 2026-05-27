import { ChangeEvent } from 'react';
import { Box, Stack } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import { formatCurrency, packageImageUrl, PackageForm, packageTypes } from './types';

interface AddPackageProps {
  packageForm: PackageForm;
  isEditing: boolean;
  t: (key: string) => string;
  onPackageChange: (
    field: keyof PackageForm,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onUploadPackageImages: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmitPackage: () => void;
  onCancelEdit?: () => void;
}

const AddPackage = ({
  packageForm,
  isEditing,
  t,
  onPackageChange,
  onUploadPackageImages,
  onSubmitPackage,
  onCancelEdit,
}: AddPackageProps) => (
  <Box className='mypage-profile-grid'>
    <Stack className='mypage-panel'>
      <Stack className='mypage-panel-head'>
        <span>{t('Agent Listing')}</span>
        <h2>{isEditing ? t('Update insurance package') : t('Create insurance package')}</h2>
      </Stack>
      <Box component='form' className='mypage-form'>
        <Stack className='mypage-upload-row'>
          <Box
            component='img'
            src={packageImageUrl(packageForm.packageImages[0])}
            alt={packageForm.packageName || t('Package preview')}
          />
          <Stack>
            <label className='mypage-upload-btn' htmlFor='mypage-package-images'>
              <CloudUploadOutlinedIcon />
              {t('Upload Package Images')}
            </label>
            <input
              id='mypage-package-images'
              className='mypage-file-input'
              type='file'
              accept='image/png,image/jpeg,image/jpg,image/webp'
              multiple
              onChange={onUploadPackageImages}
            />
            <small>{t('Upload up to 5 JPG, PNG, or WEBP images.')}</small>
          </Stack>
        </Stack>

        <Box className='mypage-form-grid'>
          <label>
            <span>{t('Package Name')}</span>
            <input value={packageForm.packageName} onChange={onPackageChange('packageName')} />
          </label>
          <label>
            <span>{t('Package Type')}</span>
            <select value={packageForm.packageType} onChange={onPackageChange('packageType')}>
              <option value=''>{t('Select package type')}</option>
              {packageTypes.map((type) => (
                <option key={type} value={type}>
                  {t(type)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t('Monthly Price')}</span>
            <input type='number' min='0' value={packageForm.packagePrice} onChange={onPackageChange('packagePrice')} />
          </label>
          <label>
            <span>{t('Coverage Limit')}</span>
            <input
              type='number'
              min='0'
              value={packageForm.packageCoverageLimit}
              onChange={onPackageChange('packageCoverageLimit')}
            />
          </label>
          <label>
            <span>{t('Minimum Age')}</span>
            <input type='number' min='0' value={packageForm.packageMinAge} onChange={onPackageChange('packageMinAge')} />
          </label>
          <label>
            <span>{t('Maximum Age')}</span>
            <input type='number' min='0' value={packageForm.packageMaxAge} onChange={onPackageChange('packageMaxAge')} />
          </label>
          <label className='wide'>
            <span>{t('Tags')}</span>
            <input
              value={packageForm.packageAssetTags}
              placeholder={t('Example: family, accident, premium')}
              onChange={onPackageChange('packageAssetTags')}
            />
          </label>
          <label className='wide'>
            <span>{t('Description')}</span>
            <textarea value={packageForm.packageDesc} onChange={onPackageChange('packageDesc')} />
          </label>
        </Box>

        <Stack className='mypage-actions'>
          <button type='button' onClick={onSubmitPackage}>
            <AddBusinessOutlinedIcon />
            {isEditing ? t('Update Package') : t('Create Package')}
          </button>
          {isEditing && onCancelEdit ? (
            <button type='button' className='ghost' onClick={onCancelEdit}>
              {t('Cancel')}
            </button>
          ) : null}
        </Stack>
      </Box>
    </Stack>

    <Stack className='mypage-preview-card'>
      <Box
        component='img'
        src={packageImageUrl(packageForm.packageImages[0])}
        alt={packageForm.packageName || t('Package preview')}
      />
      <span>{packageForm.packageType ? t(packageForm.packageType) : t('New Package')}</span>
      <h2>{packageForm.packageName || t('Package preview')}</h2>
      <p>{packageForm.packageDesc || t('Your package description will appear here.')}</p>
      <Box className='mypage-preview-meta'>
        <Stack>
          <strong>{formatCurrency(Number(packageForm.packagePrice || 0))}</strong>
          <span>{t('Monthly Price')}</span>
        </Stack>
        <Stack>
          <strong>{packageForm.packageCoverageLimit ? formatCurrency(Number(packageForm.packageCoverageLimit)) : '$0'}</strong>
          <span>{t('Coverage Limit')}</span>
        </Stack>
      </Box>
    </Stack>
  </Box>
);

export default AddPackage;
