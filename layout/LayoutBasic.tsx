import type { ReactElement, ReactNode } from 'react';

import { Box } from '@mui/material';

import Top from '@/libs/components/navigation/Top';
import Footer from '@/libs/components/footer/Footer';

const LayoutBasic = (page: ReactElement): ReactNode => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Top />
      <Box component="main" sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
        {page}
      </Box>
      <Footer />
    </Box>
  );
};

export default LayoutBasic;
