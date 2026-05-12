import type { ReactElement, ReactNode } from 'react';

import { Box, Container, Typography } from '@mui/material';

const LayoutAdmin = (page: ReactElement): ReactNode => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        {page}
      </Container>
    </Box>
  );
};

export default LayoutAdmin;
