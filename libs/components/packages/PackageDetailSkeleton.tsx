import { Box } from '@mui/material';

const PackageDetailSkeleton = () => (
  <Box className={'pd-page'}>
    <Box className={'pd-skeleton'}>
      <Box className={'pd-container'}>
        <Box className={'pd-main'}>
          <Box className={'sk-line'} style={{ width: 140, height: 22 }} />
          <Box
            className={'sk-line'}
            style={{ width: '65%', height: 44, marginTop: 12 }}
          />
          <Box className={'sk-img'} />
          <Box
            className={'sk-line'}
            style={{ width: '100%', height: 16, marginTop: 24 }}
          />
          <Box
            className={'sk-line'}
            style={{ width: '80%', height: 16, marginTop: 8 }}
          />
        </Box>
        <Box className={'pd-sidebar'}>
          <Box className={'sk-card'} />
          <Box className={'sk-card'} style={{ height: 200, marginTop: 16 }} />
        </Box>
      </Box>
    </Box>
  </Box>
);

export default PackageDetailSkeleton;
