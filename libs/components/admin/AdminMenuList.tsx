import { ReactElement } from 'react';
import { Box, Stack } from '@mui/material';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import { useRouter } from 'next/router';

type AdminMenuItem = {
  label: string;
  path: string;
  icon: ReactElement;
};

const ADMIN_MENU: AdminMenuItem[] = [
  { label: 'Users', path: '/_admin/users', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Packages', path: '/_admin/packages', icon: <Inventory2OutlinedIcon /> },
  { label: 'Policies', path: '/_admin/policies', icon: <PolicyOutlinedIcon /> },
  { label: 'Claims', path: '/_admin/claims', icon: <GavelOutlinedIcon /> },
  { label: 'Notices', path: '/_admin/notices', icon: <CampaignOutlinedIcon /> },
  { label: 'FAQs', path: '/_admin/faqs', icon: <HelpOutlineOutlinedIcon /> },
  { label: 'Community', path: '/_admin/community', icon: <ForumOutlinedIcon /> },
  { label: 'Comments', path: '/_admin/comments', icon: <ChatBubbleOutlineOutlinedIcon /> },
];

const AdminMenuList = () => {
  const router = useRouter();

  return (
    <Stack className='admin-menu-list'>
      {ADMIN_MENU.map((item) => {
        const active = router.pathname.startsWith(item.path);

        return (
          <button
            className={active ? 'admin-menu-item active' : 'admin-menu-item'}
            key={item.path}
            type='button'
            onClick={() => router.push(item.path)}
          >
            <Box className='admin-menu-icon'>{item.icon}</Box>
            <span>{item.label}</span>
          </button>
        );
      })}
    </Stack>
  );
};

export default AdminMenuList;
