import type { ReactElement, ReactNode } from 'react';

import { Box } from '@mui/material';

import Top from '@/libs/components/navigation/Top';
import Footer from '@/libs/components/footer/Footer';

const LayoutHome = (page: ReactElement): ReactNode => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Top />
      <Box component="main" sx={{ flex: 1 }}>
        {page}
      </Box>
      <Footer />
    </Box>
  );
};

export default LayoutHome;
