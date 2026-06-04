import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import UnpublishedOutlinedIcon from '@mui/icons-material/UnpublishedOutlined';
import { Box, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { AgentOwnedPackage, formatCurrency, formatDate, packageImageUrl } from './types';
import MyPageEmpty from './MyPageEmpty';
import MyPagePagination from './MyPagePagination';

interface MyPackagesProps {
  packages: AgentOwnedPackage[];
  loading: boolean;
  error?: string | null;
  status: string;
  page: number;
  totalPages: number;
  t: (key: string, options?: Record<string, unknown>) => string;
  onStatusChange: (status: string) => void;
  onEditPackage: (pkg: AgentOwnedPackage) => void;
  onUpdateStatus: (packageId: string, nextStatus: string) => void;
  onPageChange: (page: number) => void;
}

const MyPackages = ({
  packages,
  loading,
  error,
  status,
  page,
  totalPages,
  t,
  onStatusChange,
  onEditPackage,
  onUpdateStatus,
  onPageChange,
}: MyPackagesProps) => (
  <MyPackagesContent
    packages={packages}
    loading={loading}
    error={error}
    status={status}
    page={page}
    totalPages={totalPages}
    t={t}
    onStatusChange={onStatusChange}
    onEditPackage={onEditPackage}
    onUpdateStatus={onUpdateStatus}
    onPageChange={onPageChange}
  />
);

const MyPackagesContent = ({
  packages,
  loading,
  error,
  status,
  page,
  totalPages,
  t,
  onStatusChange,
  onEditPackage,
  onUpdateStatus,
  onPageChange,
}: MyPackagesProps) => {
  const router = useRouter();

  return (
    <Stack className='mypage-panel'>
    <Stack className='mypage-panel-head row'>
      <Stack>
        <span>{t('My Packages')}</span>
        <h2>{t('Manage your insurance listings')}</h2>
      </Stack>
      <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
        <option value=''>{t('All Statuses')}</option>
        <option value='ACTIVE'>{t('ACTIVE')}</option>
        <option value='INACTIVE'>{t('INACTIVE')}</option>
        <option value='ARCHIVED'>{t('ARCHIVED')}</option>
      </select>
    </Stack>

    {loading ? (
      <Box className='mypage-favorites-grid'>
        {Array.from({ length: 3 }).map((_, index) => (
          <Box key={index} className='mypage-skeleton-card' />
        ))}
      </Box>
    ) : error ? (
      <MyPageEmpty title={t('Could not load packages.')} text={error} />
    ) : packages.length === 0 ? (
      <MyPageEmpty
        title={t('No packages yet')}
        text={t('Create your first insurance package and it will appear here for editing and status control.')}
      />
    ) : (
      <>
        <Box className='mypage-favorites-grid'>
          {packages.map((pkg) => (
            <Stack key={pkg._id} className='mypage-favorite-card'>
              <Box component='img' src={packageImageUrl(pkg.packageImages?.[0])} alt={pkg.packageTitle} />
              <Stack>
                <span>{pkg.packageType}</span>
                <h3>{pkg.packageTitle}</h3>
                <p>{formatCurrency(pkg.packagePrice)} / {t('month')}</p>
                <Box className={`mypage-status ${pkg.packageStatus.toLowerCase()}`}>{t(pkg.packageStatus)}</Box>
                <Box className='mypage-card-meta'>
                  <span>{t('Coverage')}: {formatCurrency(pkg.packageCoverageLimit)}</span>
                  <span>{t('Views')}: {pkg.packageViews ?? 0}</span>
                  <span>{t('Updated')}: {formatDate(pkg.updatedAt, router.locale)}</span>
                </Box>
                <Stack className='mypage-card-actions'>
                  <button onClick={() => onEditPackage(pkg)}>
                    <EditOutlinedIcon />
                    {t('Edit Package')}
                  </button>
                  {pkg.packageStatus === 'ARCHIVED' ? (
                    <button className='ghost' onClick={() => onUpdateStatus(pkg._id, 'ACTIVE')}>
                      <RestoreOutlinedIcon />
                      {t('Activate')}
                    </button>
                  ) : (
                    <button className='ghost danger' onClick={() => onUpdateStatus(pkg._id, 'ARCHIVED')}>
                      <UnpublishedOutlinedIcon />
                      {t('Archive')}
                    </button>
                  )}
                </Stack>
              </Stack>
            </Stack>
          ))}
        </Box>
        <MyPagePagination page={page} totalPages={totalPages} onChange={onPageChange} t={t} />
      </>
    )}
    </Stack>
  );
};

export default MyPackages;
