import Head from 'next/head';
import type { NextPageWithLayout } from '@/libs/types/next';
import type { ReactElement } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import NextLink from 'next/link';

import LayoutHome from '@/layout/LayoutHome';

const HomePage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>INSU Web</title>
      </Head>
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
            <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 2 }}>
              Insurance-AI Frontend
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, maxWidth: 720 }}>
              Day 2 complete: Layout, navigation, and auth shell are ready.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680 }}>
              We mirrored nestar-next structure with reusable layouts, top navigation, footer, Apollo wiring, and login/register flow.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <NextLink href="/account/join" passHref legacyBehavior>
                <Button component="a" variant="contained" size="large">
                  Open Login/Register
                </Button>
              </NextLink>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

HomePage.getLayout = (page: ReactElement) => {
  return LayoutHome(page);
};

export default HomePage;
