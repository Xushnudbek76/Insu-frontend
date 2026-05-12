import '@/scss/app.scss';

import { ApolloProvider } from '@apollo/client/react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';

import { useApollo } from '@/apollo/client';
import type { AppProps } from 'next/app';

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

export default function App({ Component, pageProps }: AppProps) {
  const client = useApollo(null);

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
