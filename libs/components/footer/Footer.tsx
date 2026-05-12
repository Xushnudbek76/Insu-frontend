import NextLink from 'next/link';
import { Box, Divider, Link as MuiLink, Stack, Typography } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.100', mt: 8, pt: 6, pb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 360 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              INSU
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Smart insurance marketplace powered by AI. Discover tailored packages, compare coverage, and manage your policies effortlessly.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 6 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Explore
              </Typography>
              <NextLink href="/packages" passHref legacyBehavior>
                <MuiLink underline="none">Packages</MuiLink>
              </NextLink>
              <NextLink href="/agents" passHref legacyBehavior>
                <MuiLink underline="none">Agents</MuiLink>
              </NextLink>
              <NextLink href="/community" passHref legacyBehavior>
                <MuiLink underline="none">Community</MuiLink>
              </NextLink>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Support
              </Typography>
              <NextLink href="/cs" passHref legacyBehavior>
                <MuiLink underline="none">Help Center</MuiLink>
              </NextLink>
              <MuiLink underline="none" href="mailto:support@insu.ai">
                Contact
              </MuiLink>
              <NextLink href="/about" passHref legacyBehavior>
                <MuiLink underline="none">About</MuiLink>
              </NextLink>
            </Box>
          </Box>
        </Box>

        <Divider />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} INSU. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <NextLink href="/terms" passHref legacyBehavior>
              <MuiLink underline="none">Terms</MuiLink>
            </NextLink>
            <NextLink href="/privacy" passHref legacyBehavior>
              <MuiLink underline="none">Privacy</MuiLink>
            </NextLink>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
