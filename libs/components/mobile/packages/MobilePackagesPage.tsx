import { Dispatch, MouseEvent, SetStateAction, useState } from 'react';
import { Box, Stack } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useTranslation } from 'next-i18next/pages';
import type { PackageSelectOption } from '@/libs/components/packages/config';
import type { PackageFilterValues } from '@/libs/components/packages/PackageFilter';
import PackageFilter from '@/libs/components/packages/PackageFilter';
import { buildPageNumbers } from '@/libs/utils/pagination';
import { formatCount } from '@/libs/utils/format';

interface InsurancePackage {
  _id: string;
  packageType: string;
  packageTitle: string;
  packagePrice: number;
  packageImages?: string[] | null;
  packageViews?: number | null;
  packageLikes?: number | null;
  packageComments?: number | null;
  packageCoverageLimit?: number | null;
  packageMinAge?: number | null;
  packageMaxAge?: number | null;
  meLiked?: { myFavorite: boolean }[] | null;
}

interface MobilePackagesPageProps {
  filterValues: PackageFilterValues;
  setFilterValues: Dispatch<SetStateAction<PackageFilterValues>>;
  typeOptions: PackageSelectOption[];
  statusOptions: PackageSelectOption[];
  coverageOptions: PackageSelectOption[];
  sortOptions: PackageSelectOption[];
  packages: InsurancePackage[];
  total: number;
  page: number;
  totalPages: number;
  sort: string;
  isLoading: boolean;
  getImage: (images?: string[] | null) => string;
  typeLabel: (value: string) => string;
  formatCoverage: (value?: number | null) => string | null;
  onApplyFilters: () => void;
  onSortChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onOpenPackage: (packageId: string) => void;
  onToggleLike: (event: MouseEvent, id: string) => void;
}

const MobilePackagesPage = ({
  filterValues,
  setFilterValues,
  typeOptions,
  statusOptions,
  coverageOptions,
  sortOptions,
  packages,
  total,
  page,
  totalPages,
  sort,
  isLoading,
  getImage,
  typeLabel,
  formatCoverage,
  onApplyFilters,
  onSortChange,
  onPageChange,
  onOpenPackage,
  onToggleLike,
}: MobilePackagesPageProps) => {
  const { t } = useTranslation('common');
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <Stack className='mobile-packages-page'>
      <Stack className='mobile-page-hero'>
        <span>{t('Insurance Packages')}</span>
        <h1>{t('Find protection that fits your life')}</h1>
        <p>{t('Browse active plans, compare coverage, and save the ones you want to revisit.')}</p>
      </Stack>

      <Stack className='mobile-packages-toolbar'>
        <button className='mobile-filter-trigger' onClick={() => setFiltersOpen((prev) => !prev)}>
          <TuneOutlinedIcon />
          {filtersOpen ? t('Hide filters') : t('Show filters')}
        </button>
        <label className='mobile-sort-field'>
          <span>{t('Sort')}</span>
          <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </select>
        </label>
      </Stack>

      {filtersOpen && (
        <Box className='mobile-packages-filter-sheet'>
          <PackageFilter
            values={filterValues}
            typeOptions={typeOptions}
            statusOptions={statusOptions}
            coverageOptions={coverageOptions}
            onChange={setFilterValues}
            onApply={() => {
              onApplyFilters();
              setFiltersOpen(false);
            }}
          />
        </Box>
      )}

      <Stack className='mobile-packages-summary'>
        <strong>{total}</strong>
        <span>{t('packages available')}</span>
      </Stack>

      {isLoading ? (
        <Box className='mobile-packages-list'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Box key={index} className='mobile-package-card skeleton' />
          ))}
        </Box>
      ) : packages.length === 0 ? (
        <Stack className='mobile-empty-card'>
          <SearchOutlinedIcon />
          <h2>{t('No insurance packages found.')}</h2>
          <p>{t('Try adjusting your filters or searching with broader terms.')}</p>
        </Stack>
      ) : (
        <Box className='mobile-packages-list'>
          {packages.map((pkg) => {
            const liked = pkg.meLiked?.[0]?.myFavorite;
            return (
              <Stack key={pkg._id} className='mobile-package-card' onClick={() => onOpenPackage(pkg._id)}>
                <Box
                  className='mobile-package-image'
                  style={{ backgroundImage: `url(${getImage(pkg.packageImages)})` }}
                />
                <Stack className='mobile-package-body'>
                  <div className='mobile-package-topline'>
                    <span>{typeLabel(pkg.packageType)}</span>
                    <strong>${pkg.packagePrice.toLocaleString()}{t('/mo')}</strong>
                  </div>
                  <h3>{pkg.packageTitle}</h3>
                  <Stack className='mobile-package-badges'>
                    {pkg.packageCoverageLimit != null && (
                      <span>
                        <ShieldOutlinedIcon />
                        {formatCoverage(pkg.packageCoverageLimit)}
                      </span>
                    )}
                    {pkg.packageMinAge != null && <span>{t('Ages')} {pkg.packageMinAge}-{pkg.packageMaxAge ?? '∞'}</span>}
                  </Stack>
                  <Stack className='mobile-package-stats'>
                    <span>
                      <VisibilityOutlinedIcon />
                      {formatCount(pkg.packageViews)}
                    </span>
                    <button className={liked ? 'liked' : ''} onClick={(event) => onToggleLike(event, pkg._id)}>
                      {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      {formatCount(pkg.packageLikes)}
                    </button>
                    <span>
                      <ChatBubbleOutlinedIcon />
                      {formatCount(pkg.packageComments)}
                    </span>
                  </Stack>
                </Stack>
              </Stack>
            );
          })}
        </Box>
      )}

      {totalPages > 1 && (
        <Box className='mobile-pagination'>
          <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeftIcon />
          </button>
          {buildPageNumbers(page, totalPages).map((pageNumber, index) =>
            pageNumber === '...' ? (
              <span key={`mobile-dots-${index}`}>…</span>
            ) : (
              <button
                key={pageNumber}
                className={pageNumber === page ? 'active' : ''}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ),
          )}
          <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRightIcon />
          </button>
        </Box>
      )}
    </Stack>
  );
};

export default MobilePackagesPage;
