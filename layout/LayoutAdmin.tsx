import type { ComponentType, ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useRouter } from 'next/router';
import { userVar } from '@/apollo/store';
import AdminMenuList from '@/libs/components/admin/AdminMenuList';
import { adminUserImage } from '@/libs/admin/image';
import { getJwtToken, logOut, updateUserInfo } from '@/libs/auth';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';

const LayoutAdminInner = ({ page }: { page: ReactElement }) => {
  const router = useRouter();
  const [user, setUser] = useState<CustomJwtPayload | null>(() => userVar());
  const device = useDeviceDetect();
  const wrapId = device === 'mobile' ? 'mobile-wrap' : 'pc-wrap';
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = getJwtToken();
    if (token && !userVar()?._id) updateUserInfo(token);
    setUser(userVar());
    setAuthReady(true);

    const dispose = userVar.onNextChange((nextUser) => setUser(nextUser));
    return () => {
      if (typeof dispose === 'function') dispose();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (user?.memberType !== 'ADMIN') router.replace('/');
  }, [authReady, router, user?.memberType]);

  if (!device) return null;

  if (!authReady || user?.memberType !== 'ADMIN') {
    return (
      <Box id={wrapId}>
        <Stack className='admin-guard-loading'>
          <ShieldOutlinedIcon />
          <span>Checking admin access...</span>
        </Stack>
      </Box>
    );
  }

  const adminName = user.memberNick || user.memberFullName || 'Admin';
  const adminImage = adminUserImage(user.memberImage);

  return (
    <Box id={wrapId}>
      <Stack className='admin-layout'>
        <Stack className='admin-sidebar'>
          <Stack className='admin-brand'>
            <Box className='admin-brand-mark'>
              <ShieldOutlinedIcon />
            </Box>
            <Box>
              <strong>Insu Admin</strong>
              <span>Control Center</span>
            </Box>
          </Stack>

          <Stack className='admin-profile-mini'>
            <Box component='img' src={adminImage} alt={adminName} />
            <Box>
              <strong>{adminName}</strong>
              <span>ADMIN</span>
            </Box>
          </Stack>

          <AdminMenuList />
        </Stack>

        <Stack className='admin-main'>
          <Stack className='admin-topbar'>
            <Box>
              <span>Dashboard</span>
              <strong>Insurance operations</strong>
            </Box>
            <button className='admin-logout' type='button' onClick={logOut}>
              <LogoutOutlinedIcon />
              Logout
            </button>
          </Stack>
          <Box className='admin-content'>{page}</Box>
        </Stack>
      </Stack>
    </Box>
  );
};

const withLayoutAdmin = <P extends object>(Component: ComponentType<P>) => {
  const Wrapped = (props: P) => (
    <LayoutAdminInner page={<Component {...props} />} />
  );
  Wrapped.displayName = `withLayoutAdmin(${Component.displayName ?? Component.name})`;
  return Wrapped;
};

export default withLayoutAdmin;
