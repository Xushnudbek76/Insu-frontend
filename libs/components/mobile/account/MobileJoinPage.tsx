import type { SyntheticEvent } from 'react';
import { Alert, Box, Button, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next/pages';

interface MobileJoinPageProps {
  activeTab: number;
  loading: boolean;
  error: string;
  loginNick: string;
  loginPassword: string;
  signupNick: string;
  signupPassword: string;
  signupPhone: string;
  signupType: 'USER' | 'AGENT';
  onTabChange: (_: SyntheticEvent, value: number) => void;
  onLoginNickChange: (value: string) => void;
  onLoginPasswordChange: (value: string) => void;
  onSignupNickChange: (value: string) => void;
  onSignupPasswordChange: (value: string) => void;
  onSignupPhoneChange: (value: string) => void;
  onSignupTypeChange: (value: 'USER' | 'AGENT') => void;
  onLogin: () => void;
  onSignup: () => void;
}

const MobileJoinPage = ({
  activeTab,
  loading,
  error,
  loginNick,
  loginPassword,
  signupNick,
  signupPassword,
  signupPhone,
  signupType,
  onTabChange,
  onLoginNickChange,
  onLoginPasswordChange,
  onSignupNickChange,
  onSignupPasswordChange,
  onSignupPhoneChange,
  onSignupTypeChange,
  onLogin,
  onSignup,
}: MobileJoinPageProps) => (
  <MobileJoinContent
    activeTab={activeTab}
    loading={loading}
    error={error}
    loginNick={loginNick}
    loginPassword={loginPassword}
    signupNick={signupNick}
    signupPassword={signupPassword}
    signupPhone={signupPhone}
    signupType={signupType}
    onTabChange={onTabChange}
    onLoginNickChange={onLoginNickChange}
    onLoginPasswordChange={onLoginPasswordChange}
    onSignupNickChange={onSignupNickChange}
    onSignupPasswordChange={onSignupPasswordChange}
    onSignupPhoneChange={onSignupPhoneChange}
    onSignupTypeChange={onSignupTypeChange}
    onLogin={onLogin}
    onSignup={onSignup}
  />
);

const MobileJoinContent = ({
  activeTab,
  loading,
  error,
  loginNick,
  loginPassword,
  signupNick,
  signupPassword,
  signupPhone,
  signupType,
  onTabChange,
  onLoginNickChange,
  onLoginPasswordChange,
  onSignupNickChange,
  onSignupPasswordChange,
  onSignupPhoneChange,
  onSignupTypeChange,
  onLogin,
  onSignup,
}: MobileJoinPageProps) => {
  const { t } = useTranslation('common');

  return (
    <Stack className='mobile-join-page'>
    <Stack className='mobile-join-hero'>
      <span>{t('INSU Account')}</span>
      <h1>{t('Welcome back')}</h1>
      <p>{t('Log in to manage policies and claims, or create an account to explore insurance plans.')}</p>
    </Stack>

    <Box className='mobile-join-card'>
      <Tabs value={activeTab} onChange={onTabChange} variant='fullWidth'>
        <Tab label={t('Login')} />
        <Tab label={t('Register')} />
      </Tabs>

      {error ? <Alert severity='error'>{error}</Alert> : null}

      {activeTab === 0 ? (
        <Stack spacing={2.2} className='mobile-join-form'>
          <TextField label={t('Nickname')} value={loginNick} onChange={(event) => onLoginNickChange(event.target.value)} fullWidth />
          <TextField
            label={t('Password')}
            type='password'
            value={loginPassword}
            onChange={(event) => onLoginPasswordChange(event.target.value)}
            fullWidth
          />
          <Button variant='contained' size='large' disabled={loading || !loginNick || !loginPassword} onClick={onLogin}>
            {loading ? t('Logging in...') : t('Login')}
          </Button>
        </Stack>
      ) : (
        <Stack spacing={2.2} className='mobile-join-form'>
          <TextField label={t('Nickname')} value={signupNick} onChange={(event) => onSignupNickChange(event.target.value)} fullWidth />
          <TextField
            label={t('Password')}
            type='password'
            value={signupPassword}
            onChange={(event) => onSignupPasswordChange(event.target.value)}
            fullWidth
          />
          <TextField label={t('Phone')} value={signupPhone} onChange={(event) => onSignupPhoneChange(event.target.value)} fullWidth />
          <TextField
            select
            label={t('Member Type')}
            value={signupType}
            onChange={(event) => onSignupTypeChange(event.target.value as 'USER' | 'AGENT')}
            fullWidth
          >
            <MenuItem value='USER'>USER</MenuItem>
            <MenuItem value='AGENT'>AGENT</MenuItem>
          </TextField>
          <Button
            variant='contained'
            size='large'
            disabled={loading || !signupNick || !signupPassword || !signupPhone}
            onClick={onSignup}
          >
            {loading ? t('Registering...') : t('Create Account')}
          </Button>
        </Stack>
      )}

      <Typography variant='body2' color='text.secondary' className='mobile-join-note'>
        {t('Your account unlocks policy tracking, claims, favorites, and agent contact tools.')}
      </Typography>
    </Box>
    </Stack>
  );
};

export default MobileJoinPage;
