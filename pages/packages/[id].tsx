import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Stack, Box } from '@mui/material';

import withLayoutMain from '@/layout/LayoutHome';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { initializeApollo } from '@/apollo/client';
import { GET_PACKAGE } from '@/apollo/user/query';

interface PackageDetail {
  _id: string;
  packageType: string;
  packageStatus: string;
  packageTitle: string;
  packageDesc?: string | null;
  packagePrice: number;
  packageCoverageLimit?: number | null;
  packageMinAge?: number | null;
  packageMaxAge?: number | null;
  packageAssetTags?: string[] | null;
  packageImages?: string[] | null;
  packageViews?: number | null;
  packageLikes?: number | null;
}

interface GetPackageResponse {
  getPackage: PackageDetail;
}

const PackageDetailPage: NextPage = () => {
  const router = useRouter();
  const device = useDeviceDetect();
  const { id } = router.query;

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id || typeof id !== 'string') return;

    const client = initializeApollo(null);
    setLoading(true);
    setError(null);

    client
      .query<GetPackageResponse>({
        query: GET_PACKAGE,
        variables: { packageId: id },
      })
      .then((response) => {
        setPkg(response.data.getPackage);
      })
      .catch((err: any) => {
        // eslint-disable-next-line no-console
        console.error('Error, getPackage', err);
        const graphQLErrorMessage =
          err?.graphQLErrors?.[0]?.message ?? err?.message ?? '';
        if (graphQLErrorMessage === 'No data found!') {
          setError('Package not found.');
        } else {
          setError('Failed to load package. Please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router.isReady, id]);

  return (
    <Stack className={'home-page'}>
      <Stack className={'package-detail'}>
        <Stack className={'container'}>
          <Stack className={'info-box'}>
            <Box component={'div'} className={'left'}>
              <span>Package details</span>
              <p>View full coverage, pricing, and age range for this plan.</p>
            </Box>
          </Stack>

          {loading && (
            <Box component={'div'} className={'empty-list'}>
              Loading package...
            </Box>
          )}

          {!loading && error && (
            <Box component={'div'} className={'empty-list'}>
              {error}
            </Box>
          )}

          {!loading && !error && pkg && (
            <Box component={'div'} className={'package-detail-card'}>
              <span className={'package-type'}>{pkg.packageType}</span>
              <strong className={'package-name'}>{pkg.packageTitle}</strong>
              {pkg.packageDesc && (
                <p className={'package-desc'}>{pkg.packageDesc}</p>
              )}
              <span className={'package-price'}>
                ${pkg.packagePrice.toLocaleString()} / month
              </span>
              <Box component={'div'} className={'package-meta-row'}>
                {typeof pkg.packageCoverageLimit === 'number' && (
                  <span>
                    Coverage up to ${pkg.packageCoverageLimit.toLocaleString()}
                  </span>
                )}
                {typeof pkg.packageViews === 'number' && (
                  <span>{pkg.packageViews.toLocaleString()} views</span>
                )}
                {typeof pkg.packageLikes === 'number' && (
                  <span>{pkg.packageLikes.toLocaleString()} likes</span>
                )}
              </Box>
              <Box component={'div'} className={'package-meta-row'}>
                {typeof pkg.packageMinAge === 'number' && (
                  <span>Min age: {pkg.packageMinAge}</span>
                )}
                {typeof pkg.packageMaxAge === 'number' && (
                  <span>Max age: {pkg.packageMaxAge}</span>
                )}
              </Box>
              {pkg.packageAssetTags && pkg.packageAssetTags.length > 0 && (
                <Box component={'div'} className={'package-tags'}>
                  {pkg.packageAssetTags.map((tag) => (
                    <span key={tag} className={'tag-chip'}>
                      {tag}
                    </span>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default withLayoutMain(PackageDetailPage);
