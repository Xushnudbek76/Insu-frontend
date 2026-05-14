import { useState, useMemo, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { userVar } from '@/apollo/store';
import { logOut } from '@/libs/auth';

type NavLink = { href: string; label: string };

const baseLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/packages', label: 'Insurance' },
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
    const dispose = userVar.onNextChange((nextUser) => setUser(nextUser));
    return () => { if (typeof dispose === 'function') dispose(); };
  }, []);

  const links = useMemo(() => {
    return user ? [...baseLinks, { href: '/mypage', label: 'My Page' }] : baseLinks;
  }, [user]);

  const handleOpenProfileMenu = (e: React.MouseEvent<HTMLElement>) => setProfileMenuAnchor(e.currentTarget);
  const handleCloseProfileMenu = () => setProfileMenuAnchor(null);
  const handleLogout = () => { handleCloseProfileMenu(); logOut(); };

  const renderLinks = () =>
    links.map((link) => (
      <NextLink key={link.href} href={link.href} passHref legacyBehavior>
        <a
          className={`nav-link${
            router.pathname === link.href ||
            (link.href !== '/' && router.pathname.startsWith(`${link.href}/`))
              ? ' active'
              : ''
          }`}
        >
          {link.label}
        </a>
      </NextLink>
    ));

  if (device === 'mobile') {
    return (
      <div id="top">
        <nav className="navbar mobile">
          <div className="navbar-inner">
            <div className="logo-box">
              <NextLink href="/" passHref legacyBehavior>
                <a>INSU</a>
              </NextLink>
            </div>
            <IconButton onClick={() => setMobileMenuOpen((p) => !p)} aria-label="toggle navigation">
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </div>
          {mobileMenuOpen && (
            <div className="mobile-menu">
              {renderLinks()}
              {user ? (
                <button className="join-btn" onClick={handleLogout}>Logout</button>
              ) : (
                <NextLink href="/account/join" passHref legacyBehavior>
                  <a className="join-btn">Login / Register</a>
                </NextLink>
              )}
            </div>
          )}
        </nav>
      </div>
    );
  }

  return (
    <div id="top">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="logo-box">
            <NextLink href="/" passHref legacyBehavior>
              <a>INSU</a>
            </NextLink>
          </div>

          <div className="router-box">{renderLinks()}</div>

          <div className="user-box">
            {user ? (
              <>
                <IconButton onClick={handleOpenProfileMenu} size="small" aria-haspopup="true" aria-controls="profile-menu">
                  <Avatar
                    src={user.memberImage ?? undefined}
                    alt={user.memberNick ?? 'Profile'}
                    className="profile-avatar"
                  />
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
                <a className="join-btn">Login / Register</a>
              </NextLink>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Top;
