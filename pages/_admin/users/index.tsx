import { NextPage } from 'next';
import { Box, Stack } from '@mui/material';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const AdminUsers: NextPage = () => {
  return (
    <Stack className='admin-page'>
      <Box className='admin-card'>
        <h1>Users</h1>
        <p>Admin users page will manage members here.</p>
      </Box>
    </Stack>
  );
};

export default withLayoutAdmin(AdminUsers);
