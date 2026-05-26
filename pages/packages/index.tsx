import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
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
import MobilePackagesPage from '@/libs/components/mobile/packages/MobilePackagesPage';
import { sweetMixinErrorAlert } from '@/libs/sweetAlert';
import { toAssetUrl } from '@/libs/api';
import { formatCount } from '@/libs/utils/format';
import { buildPageNumbers } from '@/libs/utils/pagination';
import { isTopRankedPackage, PACKAGE_STATUS_OPTIONS } from '@/libs/utils/ranking';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import PackageFilter, { PackageFilterValues } from '@/libs/components/packages/PackageFilter';

export const getStaticProps = async ({ locale = 'en' }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const LIMIT = 9;

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'AUTO', label: 'Auto' },
  { value: 'HOME', label: 'Home' },
  { value: 'TRAVEL', label: 'Travel' },
];

const STATUS_OPTIONS = [...PACKAGE_STATUS_OPTIONS];

const COVERAGE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '100000', label: '$100k+' },
  { value: '250000', label: '$250k+' },
  { value: '500000', label: '$500k+' },
  { value: '1000000', label: '$1M+' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'packageViews', label: 'Most Viewed' },
  { value: 'packageLikes', label: 'Most Liked' },
  { value: 'packagePrice', label: 'Price' },
  { value: 'packageRank', label: 'Top Ranked' },
];

interface InsurancePackage {
  _id: string;
  packageType: string;
  packageStatus: string;
  packageTitle: string;
  packagePrice: number;
  packageViews?: number | null;
  packageLikes?: number | null;
  packageRank?: number | null;
  packageDesc?: string | null;
  packageImages?: string[] | null;
  packageCoverageLimit?: number | null;
  packageMinAge?: number | null;
  packageMaxAge?: number | null;
  packageComments?: number | null;
  meLiked?: { myFavorite: boolean }[] | null;
}

interface GetPackagesResponse {
  getPackages: {
    list: InsurancePackage[];
    metaCounter: { total: number }[];
  };
}

const PackagesPage: NextPage = () => {
  const router = useRouter();
  const device = useDeviceDetect();
  const pendingLikeIdsRef = useRef<Set<string>>(new Set());

  const [filterValues, setFilterValues] = useState<PackageFilterValues>({
    selectedType: '',
    selectedStatus: '',
    searchText: '',
    priceMin: '',
    priceMax: '',
    coverageLimit: '',
  });

  const [packages, setPackages] = useState<InsurancePackage[]>([]);
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

  useEffect(() => {
    if (!data?.getPackages) return;

    setPackages((prev) => {
      const optimisticPackages = new Map(
        prev
          .filter((pkg) => pendingLikeIdsRef.current.has(pkg._id))
          .map((pkg) => [pkg._id, pkg]),
      );

      return (data.getPackages.list || []).map(
        (pkg) => optimisticPackages.get(pkg._id) ?? pkg,
      );
    });
  }, [data]);

  useEffect(() => {
    if (!error) return;
    console.error('getPackages error', error);
  }, [error]);

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters(filterValues);
  };

  const handleToggleLike = async (e: MouseEvent, id: string) => {
    e.stopPropagation();

    if (pendingLikeIdsRef.current.has(id)) return;

    let previousPackage: InsurancePackage | undefined;

    try {
      const user = userVar();
      if (!user?._id) {
        await sweetMixinErrorAlert('Please login to like packages.');
        return;
      }

      previousPackage = packages.find((pkg) => pkg._id === id);
      if (!previousPackage) return;

      const wasLiked = previousPackage.meLiked?.[0]?.myFavorite ?? false;
      const nextLiked = !wasLiked;
      const nextLikeCount = Math.max(
        0,
        (previousPackage.packageLikes ?? 0) + (nextLiked ? 1 : -1),
      );

      pendingLikeIdsRef.current.add(id);
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg._id === id
            ? {
                ...pkg,
                packageLikes: nextLikeCount,
                meLiked: [{ ...(pkg.meLiked?.[0] ?? {}), myFavorite: nextLiked }],
              }
            : pkg,
        ),
      );

      const result = await likeTargetPackage({ variables: { packageId: id } });
      const updated = result.data?.likeTargetPackage;
      if (!updated) return;

      setPackages((prev) =>
        prev.map((pkg) =>
          pkg._id === updated._id
            ? {
                ...pkg,
                packageLikes: updated.packageLikes,
                meLiked: updated.meLiked,
              }
            : pkg,
        ),
      );
    } catch (err: any) {
      setPackages((prev) =>
        prev.map((pkg) => (pkg._id === id && previousPackage ? previousPackage : pkg)),
      );
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ??
          err?.message ??
          'Could not update favorites.',
      );
    } finally {
      pendingLikeIdsRef.current.delete(id);
    }
  };

  const getImage = (images?: string[] | null) =>
    toAssetUrl(images?.[0]) ?? '/img/placeholder-article.svg';

  const formatCoverage = (value?: number | null) =>
    value == null
      ? null
      : value >= 1_000_000
        ? `$${(value / 1_000_000).toFixed(0)}M+`
        : value >= 1_000
          ? `$${(value / 1_000).toFixed(0)}k`
          : `$${value}`;

  const typeLabel = (value: string) =>
    ({ AUTO: 'Auto', HOME: 'Home', HEALTH: 'Health', TRAVEL: 'Travel' })[value] ?? value;

  const total = data?.getPackages?.metaCounter?.[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const isLoading = queryLoading && packages.length === 0;

  if (device === 'mobile') {
    return (
      <MobilePackagesPage
        filterValues={filterValues}
        setFilterValues={setFilterValues}
        typeOptions={TYPE_OPTIONS}
        statusOptions={STATUS_OPTIONS}
        coverageOptions={COVERAGE_OPTIONS}
        sortOptions={SORT_OPTIONS}
        packages={packages}
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
          typeOptions={TYPE_OPTIONS}
          statusOptions={STATUS_OPTIONS}
          coverageOptions={COVERAGE_OPTIONS}
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
                {SORT_OPTIONS.map((option) => (
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
          ) : packages.length === 0 ? (
            <Box className={'empty-state'}>
              <ShieldOutlinedIcon className={'empty-icon'} />
              <p>No insurance packages found.</p>
              <span>Try adjusting your filters.</span>
            </Box>
          ) : (
            <Box className={'packages-grid'}>
              {packages.map((pkg, index) => {
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
