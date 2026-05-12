import { useState, useMemo, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { userVar } from '@/apollo/store';
import { logOut } from '@/libs/auth';

type NavLink = {
  href: string;
  label: string;
};

const baseLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/packages', label: 'Packages' },
  { href: '/agents', label: 'Agents' },
  { href: '/community', label: 'Community' },
  { href: '/cs', label: 'CS' },
];

const Top = () => {
  const router = useRouter();
  const device = useDeviceDetect();
  const [user, setUser] = useState(() => userVar());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const dispose = userVar.onNextChange((nextUser) => {
      setUser(nextUser);
    });

    return () => {
      if (typeof dispose === 'function') {
        dispose();
      }
    };
  }, []);

  const links = useMemo(() => {
    if (user) {
      return [...baseLinks, { href: '/mypage', label: 'My Page' }];
    }
    return baseLinks;
  }, [user]);

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleCloseProfileMenu();
    logOut();
  };

  const renderLinks = (orientation: 'row' | 'column') => (
    <Stack component="nav" direction={orientation} spacing={orientation === 'row' ? 3 : 2} sx={{ mt: orientation === 'column' ? 2 : 0 }}>
      {links.map((link) => {
        const isActive = router.pathname === link.href;
        return (
          <NextLink key={link.href} href={link.href} passHref legacyBehavior>
            <Button
              component="a"
              color={isActive ? 'primary' : 'inherit'}
              sx={{
                fontWeight: isActive ? 600 : 500,
                textTransform: 'none',
              }}
            >
              {link.label}
            </Button>
          </NextLink>
        );
      })}
    </Stack>
  );

  if (device === 'mobile') {
    return (
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
          <NextLink href="/" passHref legacyBehavior>
            <Typography component="a" variant="h6" sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}>
              INSU
            </Typography>
          </NextLink>

          <IconButton onClick={handleToggleMobileMenu} aria-label="toggle navigation">
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Toolbar>

        {mobileMenuOpen && (
          <Stack spacing={2} sx={{ px: 2, pb: 3 }}>
            {renderLinks('column')}
            {user ? (
              <Button variant="outlined" color="primary" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <NextLink href="/account/join" passHref legacyBehavior>
                <Button component="a" variant="contained" color="primary">
                  Login / Register
                </Button>
              </NextLink>
            )}
          </Stack>
        )}
      </AppBar>
    );
  }

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{ backdropFilter: 'blur(16px)', backgroundColor: 'rgba(255, 255, 255, 0.85)', borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 72 }}>
          <NextLink href="/" passHref legacyBehavior>
            <Typography component="a" variant="h5" sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}>
              INSU
            </Typography>
          </NextLink>

          {renderLinks('row')}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                <IconButton onClick={handleOpenProfileMenu} size="small" aria-haspopup="true" aria-controls="profile-menu">
                  <Avatar src={user.memberImage ?? undefined} alt={user.memberNick ?? 'Profile'} sx={{ width: 36, height: 36 }} />
                </IconButton>
                <Menu
                  id="profile-menu"
                  anchorEl={profileMenuAnchor}
                  open={Boolean(profileMenuAnchor)}
                  onClose={handleCloseProfileMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={() => router.push('/mypage')}>My Page</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <NextLink href="/account/join" passHref legacyBehavior>
                <Button component="a" variant="contained" color="primary">
                  Login / Register
                </Button>
              </NextLink>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Top;
