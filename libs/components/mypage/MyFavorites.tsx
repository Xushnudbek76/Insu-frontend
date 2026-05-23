import { Box, Stack } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { FavoritePackage, formatCurrency, packageImageUrl } from './types';
import MyPageEmpty from './MyPageEmpty';
import MyPagePagination from './MyPagePagination';

interface MyFavoritesProps {
  favorites: FavoritePackage[];
  loading: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  t: (key: string, options?: Record<string, unknown>) => string;
  onOpenPackage: (packageId: string) => void;
  onRemoveFavorite: () => void;
  onPageChange: (page: number) => void;
}

const MyFavorites = ({
  favorites,
  loading,
  error,
  page,
  totalPages,
  t,
  onOpenPackage,
  onRemoveFavorite,
  onPageChange,
}: MyFavoritesProps) => (
  <Stack className='mypage-panel'>
    <Stack className='mypage-panel-head'>
      <span>{t('My Favorites')}</span>
      <h2>{t('Saved insurance packages')}</h2>
    </Stack>
    {loading ? (
      <Box className='mypage-favorites-grid'>{Array.from({ length: 3 }).map((_, index) => <Box key={index} className='mypage-skeleton-card' />)}</Box>
    ) : error ? (
      <MyPageEmpty title={t('Could not load favorites.')} text={error} />
    ) : favorites.length === 0 ? (
      <MyPageEmpty title={t('No favorites yet')} text={t('Like packages to save them here for later comparison.')} />
    ) : (
      <>
        <Box className='mypage-favorites-grid'>
          {favorites.map((pkg) => (
            <Stack key={pkg._id} className='mypage-favorite-card' onClick={() => onOpenPackage(pkg._id)}>
              <Box component='img' src={packageImageUrl(pkg.packageImages?.[0])} alt={pkg.packageTitle} />
              <Stack>
                <span>{pkg.packageType}</span>
                <h3>{pkg.packageTitle}</h3>
                <p>{formatCurrency(pkg.packagePrice)} / {t('month')}</p>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveFavorite();
                  }}
                >
                  <ReceiptLongOutlinedIcon />
                  {t('View saved plan')}
                </button>
              </Stack>
            </Stack>
          ))}
        </Box>
        <MyPagePagination page={page} totalPages={totalPages} onChange={onPageChange} t={t} />
      </>
    )}
  </Stack>
);

export default MyFavorites;
