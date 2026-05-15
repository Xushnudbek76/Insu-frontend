import '@/scss/app.scss';

import { ApolloProvider } from '@apollo/client/react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';

import { useApollo } from '@/apollo/client';
import type { AppProps } from 'next/app';
import { getJwtToken, updateUserInfo } from '@/libs/auth';
import { appWithTranslation } from 'next-i18next/pages';
import type { UserConfig } from 'next-i18next/pages';
import i18nextConfig from '../next-i18next.config';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4040f2',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function App({ Component, pageProps }: AppProps) {
  const client = useApollo(null);

  useEffect(() => {
    const token = getJwtToken();
    if (token) {
      updateUserInfo(token);
    }
  }, []);

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
          <CssBaseline />
          <Component {...pageProps} />
        </SnackbarProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default appWithTranslation(App, i18nextConfig as UserConfig);
