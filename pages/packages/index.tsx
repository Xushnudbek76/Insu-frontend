import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { Stack, Box } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import withLayoutMain from '@/layout/LayoutHome';
import { userVar } from '@/apollo/store';
import { GET_PACKAGES } from '@/apollo/user/query';
import { LIKE_TARGET_PACKAGE } from '@/apollo/package/mutation';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { getMeLiked, useLikeToggleMap } from '@/libs/hooks/useLikeToggle';
import MobilePackagesPage from '@/libs/components/mobile/packages/MobilePackagesPage';
import {
  PACKAGE_COVERAGE_OPTIONS,
  PACKAGE_SORT_OPTIONS,
  PACKAGE_STATUS_FILTER_OPTIONS,
  PACKAGE_TYPE_OPTIONS,
} from '@/libs/components/packages/config';
import { formatCoverage, getPackageImage, typeLabel } from '@/libs/components/packages/helpers';
import { sweetMixinErrorAlert } from '@/libs/sweetAlert';
import type { PagedResult } from '@/libs/types/common';
import type { InsurancePackage } from '@/libs/types/package/package';
import { formatCount } from '@/libs/utils/format';
import { buildPageNumbers } from '@/libs/utils/pagination';
import { isTopRankedPackage } from '@/libs/utils/ranking';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import PackageFilter, { PackageFilterValues } from '@/libs/components/packages/PackageFilter';

export const getStaticProps = async ({ locale = 'en' }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const LIMIT = 9;

interface GetPackagesResponse {
  getPackages: PagedResult<InsurancePackage>;
}

const PackagesPage: NextPage = () => {
  const router = useRouter();
  const device = useDeviceDetect();

  const [filterValues, setFilterValues] = useState<PackageFilterValues>({
    selectedType: '',
    selectedStatus: '',
    searchText: '',
    priceMin: '',
    priceMax: '',
    coverageLimit: '',
  });

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('createdAt');
  const [appliedFilters, setAppliedFilters] = useState<PackageFilterValues>({
    selectedType: '',
    selectedStatus: '',
    searchText: '',
    priceMin: '',
    priceMax: '',
    coverageLimit: '',
  });

  const search = useMemo(() => {
    const nextSearch: Record<string, unknown> = {};

    if (appliedFilters.selectedType) nextSearch.packageType = appliedFilters.selectedType;
    if (appliedFilters.selectedStatus) nextSearch.packageStatus = appliedFilters.selectedStatus;
    if (appliedFilters.searchText.trim()) nextSearch.text = appliedFilters.searchText.trim();
    if (appliedFilters.priceMin) nextSearch.priceMin = Number(appliedFilters.priceMin);
    if (appliedFilters.priceMax) nextSearch.priceMax = Number(appliedFilters.priceMax);
    if (appliedFilters.coverageLimit) {
      nextSearch.coverageMin = Number(appliedFilters.coverageLimit);
    }

    return nextSearch;
  }, [appliedFilters]);

  const packageQueryVariables = useMemo(
    () => ({
      input: { page, limit: LIMIT, sort, direction: 'DESC', search },
    }),
    [page, sort, search],
  );

  const { data, loading: queryLoading, error } = useQuery<GetPackagesResponse>(GET_PACKAGES, {
    variables: packageQueryVariables,
    nextFetchPolicy: 'cache-first',
  });

  const [likeTargetPackage] = useMutation<{ likeTargetPackage: InsurancePackage }>(
    LIKE_TARGET_PACKAGE,
  );

  const packages = data?.getPackages?.list ?? [];

  const packageLikes = useLikeToggleMap<InsurancePackage, InsurancePackage>({
    items: packages,
    getId: (pkg) => pkg._id,
    getItemLiked: (pkg) => getMeLiked(pkg.meLiked),
    getItemCount: (pkg) => pkg.packageLikes,
    isAuthenticated: () => Boolean(userVar()?._id),
    onUnauthenticated: () => sweetMixinErrorAlert('Please login to like packages.'),
    mutate: async (packageId) => {
      const result = await likeTargetPackage({ variables: { packageId } });
      return result.data?.likeTargetPackage;
    },
    getServerLiked: (updated) => getMeLiked(updated.meLiked),
    getServerCount: (updated) => updated.packageLikes,
    onError: (message) => sweetMixinErrorAlert(message),
    errorMessage: 'Could not update favorites.',
  });

  const visiblePackages = useMemo(
    () =>
      packages.map((pkg) => {
        const likeState = packageLikes.getState(pkg._id, {
          liked: getMeLiked(pkg.meLiked),
          count: pkg.packageLikes ?? 0,
        });

        return {
          ...pkg,
          packageLikes: likeState.count,
          meLiked: [
            {
              ...(pkg.meLiked?.[0] ?? {}),
              myFavorite: likeState.liked,
            },
          ],
        };
      }),
    [packages, packageLikes.getState],
  );

  useEffect(() => {
    if (!error) return;
    console.error('getPackages error', error);
  }, [error]);

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters(filterValues);
  };

  const handleToggleLike = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    void packageLikes.toggle(id);
  };

  const getImage = getPackageImage;

  const total = data?.getPackages?.metaCounter?.[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const isLoading = queryLoading && visiblePackages.length === 0;

  if (device === 'mobile') {
    return (
      <MobilePackagesPage
        filterValues={filterValues}
        setFilterValues={setFilterValues}
        typeOptions={PACKAGE_TYPE_OPTIONS}
        statusOptions={PACKAGE_STATUS_FILTER_OPTIONS}
        coverageOptions={PACKAGE_COVERAGE_OPTIONS}
        sortOptions={PACKAGE_SORT_OPTIONS}
        packages={visiblePackages}
        total={total}
        page={page}
        totalPages={totalPages}
        sort={sort}
        isLoading={isLoading}
        getImage={getImage}
        typeLabel={typeLabel}
        formatCoverage={formatCoverage}
        onApplyFilters={handleApplyFilters}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onOpenPackage={(packageId) => router.push(`/packages/${packageId}`)}
        onToggleLike={handleToggleLike}
      />
    );
  }

  return (
    <Stack className={'packages-page'}>
      <Box className={'packages-hero'}>
        <h1 className={'hero-title'}>Find the Right Protection for Your Life</h1>
        <p className={'hero-sub'}>
          Discover comprehensive coverage tailored to your specific needs.
          <br />
          Explore our packages and secure your future today.
        </p>
      </Box>

          <Box className={'packages-body'}>
        <PackageFilter
          values={filterValues}
          typeOptions={PACKAGE_TYPE_OPTIONS}
          statusOptions={PACKAGE_STATUS_FILTER_OPTIONS}
          coverageOptions={PACKAGE_COVERAGE_OPTIONS}
          onChange={setFilterValues}
          onApply={handleApplyFilters}
        />

        <Box className={'packages-content'}>
          <Box className={'results-bar'}>
            <span className={'results-count'}>
              Showing <strong>{total}</strong> result{total !== 1 ? 's' : ''}
            </span>
            <Box className={'sort-box'}>
              <span className={'sort-label'}>SORT BY:</span>
              <select
                className={'sort-select'}
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
              >
                {PACKAGE_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Box>
          </Box>

          {isLoading ? (
            <Box className={'packages-grid'}>
              {[...Array(6)].map((_, index) => (
                <Box key={index} className={'pkg-card skeleton'}>
                  <Box className={'card-img-wrap skeleton-img'} />
                  <Box className={'card-body'}>
                    <Box className={'skeleton-line'} style={{ width: '70%', height: 18 }} />
                    <Box
                      className={'skeleton-line'}
                      style={{ width: '40%', height: 28, marginTop: 8 }}
                    />
                    <Box
                      className={'skeleton-line'}
                      style={{ width: '90%', height: 14, marginTop: 8 }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : visiblePackages.length === 0 ? (
            <Box className={'empty-state'}>
              <ShieldOutlinedIcon className={'empty-icon'} />
              <p>No insurance packages found.</p>
              <span>Try adjusting your filters.</span>
            </Box>
          ) : (
            <Box className={'packages-grid'}>
              {visiblePackages.map((pkg, index) => {
                const liked = pkg.meLiked?.[0]?.myFavorite;
                const isTopRanked = isTopRankedPackage(sort, index, pkg.packageRank);

                return (
                  <Box
                    key={pkg._id}
                    className={'pkg-card'}
                    onClick={() => router.push(`/packages/${pkg._id}`)}
                  >
                    <Box className={'card-img-wrap'}>
                      <Box
                        className={'card-img'}
                        style={{
                          backgroundImage: `url(${getImage(pkg.packageImages)})`,
                        }}
                      />
                      <span className={`type-badge type-${pkg.packageType.toLowerCase()}`}>
                        {typeLabel(pkg.packageType)}
                      </span>
                      {isTopRanked && (
                        <span className={'top-badge'}>TOP</span>
                      )}
                    </Box>

                    <Box className={'card-body'}>
                      <p className={'card-title'}>{pkg.packageTitle}</p>
                      <Box className={'card-price'}>
                        <span className={'price-amount'}>
                          ${pkg.packagePrice.toLocaleString()}
                        </span>
                        <span className={'price-unit'}>/ month</span>
                      </Box>

                      {(pkg.packageCoverageLimit != null || pkg.packageMinAge != null) && (
                        <Box className={'card-meta'}>
                          {pkg.packageCoverageLimit != null && (
                            <span className={'meta-item'}>
                              <ShieldOutlinedIcon />
                              Cov: {formatCoverage(pkg.packageCoverageLimit)}
                            </span>
                          )}
                          {pkg.packageMinAge != null && (
                            <span className={'meta-item'}>
                              <PersonOutlinedIcon />
                              Ages: {pkg.packageMinAge}–{pkg.packageMaxAge ?? '∞'}
                            </span>
                          )}
                        </Box>
                      )}

                      <Box className={'card-stats'}>
                        <span className={'stat'}>
                          <VisibilityOutlinedIcon />
                          {formatCount(pkg.packageViews)}
                        </span>
                        <button
                          className={`stat like-btn${liked ? ' liked' : ''}`}
                          onClick={(event) => handleToggleLike(event, pkg._id)}
                        >
                          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          {formatCount(pkg.packageLikes)}
                        </button>
                        <span className={'stat'}>
                          <ChatBubbleOutlinedIcon />
                          {formatCount(pkg.packageComments)}
                        </span>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {totalPages > 1 && (
            <Box className={'pagination'}>
              <button
                className={'pg-btn'}
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                <ChevronLeftIcon />
              </button>

              {buildPageNumbers(page, totalPages).map((pageNumber, index) =>
                pageNumber === '...' ? (
                  <span key={`dots-${index}`} className={'pg-dots'}>
                    …
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    className={`pg-btn${page === pageNumber ? ' active' : ''}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                className={'pg-btn'}
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                <ChevronRightIcon />
              </button>
            </Box>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

export default withLayoutMain(PackagesPage);
