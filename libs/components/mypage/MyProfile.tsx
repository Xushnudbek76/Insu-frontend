import { ChangeEvent } from 'react';
import { Box, Stack } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import { avatarUrl, formatCurrency, PolicyData, ProfileForm, ClaimData } from './types';

interface MyProfileProps {
  user: CustomJwtPayload;
  profileForm: ProfileForm;
  policies: PolicyData[];
  myClaims: ClaimData[];
  t: (key: string) => string;
  onProfileChange: (field: keyof ProfileForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onUploadProfileImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onUpdateProfile: () => void;
}

const MyProfile = ({
  user,
  profileForm,
  policies,
  myClaims,
  t,
  onProfileChange,
  onUploadProfileImage,
  onUpdateProfile,
}: MyProfileProps) => (
  <Box className='mypage-profile-grid'>
    <Stack className='mypage-panel'>
      <Stack className='mypage-panel-head'>
        <span>{t('Profile Settings')}</span>
        <h2>{t('Update your information')}</h2>
      </Stack>
      <Box component='form' className='mypage-form'>
        <Stack className='mypage-upload-row'>
          <Box component='img' src={avatarUrl(profileForm.memberImage)} alt={profileForm.memberNick} />
          <Stack>
            <label className='mypage-upload-btn' htmlFor='mypage-avatar-upload'>
              <CloudUploadOutlinedIcon />
              {t('Upload Profile Image')}
            </label>
            <input
              id='mypage-avatar-upload'
              className='mypage-file-input'
              type='file'
              accept='image/png,image/jpeg,image/jpg,image/webp'
              onChange={onUploadProfileImage}
            />
            <small>{t('JPG, PNG, or WEBP format recommended.')}</small>
          </Stack>
        </Stack>

        <Box className='mypage-form-grid'>
          <label>
            <span>{t('Username')}</span>
            <input value={profileForm.memberNick} onChange={onProfileChange('memberNick')} />
          </label>
          <label>
            <span>{t('Full Name')}</span>
            <input value={profileForm.memberFullName} onChange={onProfileChange('memberFullName')} />
          </label>
          <label>
            <span>{t('Phone')}</span>
            <input value={profileForm.memberPhone} onChange={onProfileChange('memberPhone')} />
          </label>
          <label>
            <span>{t('Address')}</span>
            <input value={profileForm.memberAddress} onChange={onProfileChange('memberAddress')} />
          </label>
          <label className='wide'>
            <span>{t('About')}</span>
            <textarea value={profileForm.memberDesc} onChange={onProfileChange('memberDesc')} />
          </label>
        </Box>

        <Stack className='mypage-actions'>
          <button type='button' onClick={onUpdateProfile}>
            <EditOutlinedIcon />
            {t('Update Profile')}
          </button>
        </Stack>
      </Box>
    </Stack>

    <Stack className='mypage-preview-card'>
      <Box component='img' src={avatarUrl(profileForm.memberImage)} alt={profileForm.memberNick} />
      <span>{user.memberType}</span>
      <h2>{profileForm.memberFullName || profileForm.memberNick || t('Member')}</h2>
      <p>{profileForm.memberDesc || t('Your profile description will appear here.')}</p>
      <Box className='mypage-preview-meta'>
        <Stack>
          <strong>{formatCurrency(policies.reduce((sum, policy) => sum + (policy.premiumAmount ?? 0), 0))}</strong>
          <span>{t('Monthly Premiums')}</span>
        </Stack>
        <Stack>
          <strong>{myClaims.length}</strong>
          <span>{t('Claims')}</span>
        </Stack>
      </Box>
    </Stack>
  </Box>
);

export default MyProfile;
