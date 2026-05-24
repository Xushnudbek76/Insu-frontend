import { ElementType } from 'react';
import { Box, Stack } from '@mui/material';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import { avatarUrl, Category, ProfileForm } from './types';

export interface MyPageNavItem {
  key: Category;
  label: string;
  icon: ElementType;
}

interface MyPageSidebarProps {
  user: CustomJwtPayload;
  profileForm: ProfileForm;
  isAdmin: boolean;
  activePolicies: number;
  pendingClaims: number;
  navItems: MyPageNavItem[];
  category: Category;
  t: (key: string) => string;
  onAdminClick: () => void;
  onCategoryChange: (category: Category) => void;
  onLogout: () => void;
}

const MyPageSidebar = ({
  user,
  profileForm,
  isAdmin,
  activePolicies,
  pendingClaims,
  navItems,
  category,
  t,
  onAdminClick,
  onCategoryChange,
  onLogout,
}: MyPageSidebarProps) => (
  <Stack className='mypage-sidebar'>
    <Box className='mypage-profile-aura' />
    <Stack className='mypage-user-card'>
      <Box component='img' src={avatarUrl(profileForm.memberImage) ?? '/img/profile/defaultUser.svg'} alt={user.memberNick} className='mypage-avatar' />
      <span className='mypage-role-chip'>{user.memberType}</span>
      {isAdmin && (
        <button className='mypage-admin-entry' onClick={onAdminClick}>
          <AdminPanelSettingsOutlinedIcon />
          {t('Admin Dashboard')}
        </button>
      )}
      <h2>{user.memberNick}</h2>
      <p>{user.memberPhone || t('No phone registered')}</p>
      <Box className='mypage-user-stats'>
        <Stack>
          <strong>{activePolicies}</strong>
          <span>{t('Active Policies')}</span>
        </Stack>
        <Stack>
          <strong>{pendingClaims}</strong>
          <span>{t('Pending Claims')}</span>
        </Stack>
      </Box>
    </Stack>

    <Stack className='mypage-menu'>
      <span>{t('Dashboard')}</span>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.key} className={category === item.key ? 'active' : ''} onClick={() => onCategoryChange(item.key)}>
            <Icon />
            {item.label}
          </button>
        );
      })}
    </Stack>

    <button className='mypage-logout' onClick={onLogout}>
      <LogoutOutlinedIcon />
      {t('Logout')}
    </button>
  </Stack>
);

export default MyPageSidebar;
