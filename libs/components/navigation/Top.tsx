import { useState, useMemo, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'next-i18next/pages';

import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { userVar } from '@/apollo/store';
import { logOut } from '@/libs/auth';

type NavLink = { href: string; label: string };

const SUPPORTED_LOCALES = ['en', 'kr', 'ru'];

const baseLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/packages', label: 'Insurance' },
  { href: '/agents', label: 'Agents' },
  { href: '/community', label: 'Community' },
  { href: '/cs', label: 'CS' },
];

const Top = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const device = useDeviceDetect();
  const [user, setUser] = useState(() => userVar());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const dispose = userVar.onNextChange((nextUser) => setUser(nextUser));
    return () => { if (typeof dispose === 'function') dispose(); };
  }, []);

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale');
    const nextLocale = SUPPORTED_LOCALES.includes(storedLocale ?? '') ? storedLocale! : router.locale || 'en';
    setLocale(nextLocale);
    localStorage.setItem('locale', nextLocale);

    if (router.isReady && router.locale !== nextLocale) {
      router.replace(router.asPath, router.asPath, { locale: nextLocale });
    }
  }, [router]);

  const links = useMemo(() => {
    return user ? [...baseLinks, { href: '/mypage', label: 'My Page' }] : baseLinks;
  }, [user]);

  const handleOpenProfileMenu = (e: React.MouseEvent<HTMLElement>) => setProfileMenuAnchor(e.currentTarget);
  const handleCloseProfileMenu = () => setProfileMenuAnchor(null);
  const handleLogout = () => { handleCloseProfileMenu(); logOut(); };
  const handleOpenLanguageMenu = (e: React.MouseEvent<HTMLElement>) => setLanguageMenuAnchor(e.currentTarget);
  const handleCloseLanguageMenu = () => setLanguageMenuAnchor(null);
  const handleChangeLanguage = async (nextLocale: string) => {
    setLocale(nextLocale);
    localStorage.setItem('locale', nextLocale);
    handleCloseLanguageMenu();
    await router.push(router.asPath, router.asPath, { locale: nextLocale });
  };

  const renderLanguageMenu = () => (
    <>
      <button type="button" className="language-btn" onClick={handleOpenLanguageMenu}>
        <img src={`/img/flag/lang${locale}.png`} alt={locale} />
        <KeyboardArrowDownIcon />
      </button>
      <Menu
        id="language-menu"
        anchorEl={languageMenuAnchor}
        open={Boolean(languageMenuAnchor)}
        onClose={handleCloseLanguageMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleChangeLanguage('en')}>
          <img className="language-menu-flag" src="/img/flag/langen.png" alt="English" />
          {t('English')}
        </MenuItem>
        <MenuItem onClick={() => handleChangeLanguage('kr')}>
          <img className="language-menu-flag" src="/img/flag/langkr.png" alt="Korean" />
          {t('Korean')}
        </MenuItem>
        <MenuItem onClick={() => handleChangeLanguage('ru')}>
          <img className="language-menu-flag" src="/img/flag/langru.png" alt="Russian" />
          {t('Russian')}
        </MenuItem>
      </Menu>
    </>
  );

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
          {t(link.label)}
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
                <button className="join-btn" onClick={handleLogout}>{t('Logout')}</button>
              ) : (
                <NextLink href="/account/join" passHref legacyBehavior>
                  <a className="join-btn">{t('Login / Register')}</a>
                </NextLink>
              )}
              {renderLanguageMenu()}
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
                  alt={user.memberNick ?? t('Profile')}
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
                  <MenuItem onClick={() => router.push('/mypage')}>{t('My Page')}</MenuItem>
                  <MenuItem onClick={handleLogout}>{t('Logout')}</MenuItem>
                </Menu>
              </>
            ) : (
              <NextLink href="/account/join" passHref legacyBehavior>
                <a className="join-btn">{t('Login / Register')}</a>
              </NextLink>
            )}
            {renderLanguageMenu()}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Top;
