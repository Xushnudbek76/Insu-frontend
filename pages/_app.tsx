import '@/styles/globals.css';

import { ApolloProvider } from '@apollo/client/react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import type { ReactElement } from 'react';
import { SnackbarProvider } from 'notistack';

import { useApollo } from '@/apollo/client';
import LayoutHome from '@/layout/LayoutHome';
import type { AppPropsWithLayout } from '@/libs/types/next';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff5a1f',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const client = useApollo(null);
  const getLayout =
    Component.getLayout ??
    ((page: ReactElement) => {
      return LayoutHome(page);
    });

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
          <CssBaseline />
          {getLayout(<Component {...pageProps} />)}
        </SnackbarProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}
