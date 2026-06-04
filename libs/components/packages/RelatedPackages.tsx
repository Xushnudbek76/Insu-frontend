import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'next-i18next/pages';
import { getPackageImage, typeLabel } from './helpers';
import type { RelatedPackage } from './types';

interface RelatedPackagesProps {
  packages: RelatedPackage[];
}

const RelatedPackages = ({ packages }: RelatedPackagesProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  if (packages.length === 0) return null;

  return (
    <Box component={'section'} className={'pd-related'}>
      <Box className={'pd-related-header'}>
        <Box>
          <h2 className={'pd-related-title'}>{t('Recommended for You')}</h2>
          <p className={'pd-related-sub'}>
            {t('Tailored insurance solutions based on your profile.')}
          </p>
        </Box>
        <button
          className={'pd-view-all'}
          onClick={() => router.push('/packages')}
        >
          {t('View All Plans')} <ArrowForwardIcon />
        </button>
      </Box>
      <Box className={'pd-related-grid'}>
        {packages.map((r) => (
          <Box
            key={r._id}
            className={'pd-related-card'}
            onClick={() => router.push(`/packages/${r._id}`)}
          >
            <Box className={'pd-rc-img-wrap'}>
              <Box
                className={'pd-rc-img'}
                style={{
                  backgroundImage: `url(${getPackageImage(r.packageImages)})`,
                }}
              />
              <span className={'pd-rc-type'}>{t(typeLabel(r.packageType))}</span>
            </Box>
            <Box className={'pd-rc-body'}>
              <h3 className={'pd-rc-title'}>{r.packageTitle}</h3>
              <Box className={'pd-rc-footer'}>
                <span className={'pd-rc-price'}>
                  ${r.packagePrice.toLocaleString()}{t('/mo')}
                </span>
                <ChevronRightIcon className={'pd-rc-arrow'} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RelatedPackages;
