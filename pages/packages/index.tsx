import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Stack, Box } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import withLayoutMain from "@/layout/LayoutHome";
import { initializeApollo } from "@/apollo/client";
import { userVar } from "@/apollo/store";
import { GET_PACKAGES } from "@/apollo/user/query";
import { LIKE_TARGET_PACKAGE } from "@/apollo/package/mutation";
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from "@/libs/sweetAlert";

const LIMIT = 9;

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "HEALTH", label: "Health" },
  { value: "AUTO", label: "Auto" },
  { value: "HOME", label: "Home" },
  { value: "TRAVEL", label: "Travel" },
];

const COVERAGE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "100000", label: "$100k+" },
  { value: "250000", label: "$250k+" },
  { value: "500000", label: "$500k+" },
  { value: "1000000", label: "$1M+" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest" },
  { value: "packageViews", label: "Most Viewed" },
  { value: "packageLikes", label: "Most Liked" },
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

  const [selectedType, setSelectedType] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [coverageLimit, setCoverageLimit] = useState("");

  const [packages, setPackages] = useState<InsurancePackage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");

  const [appliedType, setAppliedType] = useState("");
  const [appliedPriceMin, setAppliedPriceMin] = useState("");
  const [appliedPriceMax, setAppliedPriceMax] = useState("");
  const [appliedCoverage, setAppliedCoverage] = useState("");

  useEffect(() => {
    const client = initializeApollo(null);
    setLoading(true);

    const search: Record<string, unknown> = {};
    if (appliedType) search.packageType = appliedType;
    if (appliedPriceMin) search.priceMin = Number(appliedPriceMin);
    if (appliedPriceMax) search.priceMax = Number(appliedPriceMax);
    if (appliedCoverage) search.coverageMin = Number(appliedCoverage);

    client
      .query<GetPackagesResponse>({
        query: GET_PACKAGES,
        variables: {
          input: { page, limit: LIMIT, sort, direction: "DESC", search },
        },
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        setPackages(res.data.getPackages.list || []);
        setTotal(res.data.getPackages.metaCounter?.[0]?.total ?? 0);
      })
      .catch((err) => console.error("getPackages error", err))
      .finally(() => setLoading(false));
  }, [
    page,
    sort,
    appliedType,
    appliedPriceMin,
    appliedPriceMax,
    appliedCoverage,
  ]);

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedType(selectedType);
    setAppliedPriceMin(priceMin);
    setAppliedPriceMax(priceMax);
    setAppliedCoverage(coverageLimit);
  };

  const handleToggleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const user = userVar();
      if (!user?._id) {
        await sweetMixinErrorAlert("Please login to like packages.");
        return;
      }
      const client = initializeApollo(null);
      const result = await client.mutate<{
        likeTargetPackage: InsurancePackage;
      }>({
        mutation: LIKE_TARGET_PACKAGE,
        variables: { packageId: id },
      });
      const updated = result.data?.likeTargetPackage;
      if (!updated) return;
      setPackages((prev) =>
        prev.map((p) =>
          p._id === updated._id
            ? {
                ...p,
                packageLikes: updated.packageLikes,
                meLiked: updated.meLiked,
              }
            : p,
        ),
      );
      await sweetTopSuccessAlert("Updated your favorites.");
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace("Definer: ", "") ??
          err?.message ??
          "Could not update favorites.",
      );
    }
  };

  const getImage = (images?: string[] | null) =>
    images?.[0]
      ? `${process.env.NEXT_PUBLIC_API_URL}/${images[0]}`
      : "/img/placeholder-article.svg";
  const formatCount = (n?: number | null) =>
    n == null ? "0" : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  const formatCoverage = (n?: number | null) =>
    n == null
      ? null
      : n >= 1_000_000
        ? `$${(n / 1_000_000).toFixed(0)}M+`
        : n >= 1_000
          ? `$${(n / 1_000).toFixed(0)}k`
          : `$${n}`;
  const typeLabel = (t: string) =>
    ({ AUTO: "Auto", HOME: "Home", HEALTH: "Health", TRAVEL: "Travel" })[t] ??
    t;

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const buildPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <Stack className={"packages-page"}>
      <Box className={"packages-hero"}>
        <h1 className={"hero-title"}>
          Find the Right Protection for Your Life
        </h1>
        <p className={"hero-sub"}>
          Discover comprehensive coverage tailored to your specific needs.
          <br />
          Explore our packages and secure your future today.
        </p>
      </Box>

      <Box className={"packages-body"}>
        <Box className={"filters-sidebar"}>
          <p className={"filters-title"}>Filters</p>
          <p className={"filters-sub"}>Narrow your search</p>

          <Box className={"filter-section"}>
            <p className={"filter-label"}>INSURANCE TYPE</p>
            {TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className={"checkbox-row"}>
                <input
                  type="checkbox"
                  checked={selectedType === opt.value}
                  onChange={() => setSelectedType(opt.value)}
                  className={"pkg-checkbox"}
                />
                <span className={"checkbox-text"}>{opt.label}</span>
              </label>
            ))}
          </Box>

          <Box className={"filter-section"}>
            <p className={"filter-label"}>PRICE RANGE</p>
            <Box className={"price-row"}>
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className={"price-input"}
              />
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className={"price-input"}
              />
            </Box>
          </Box>

          <Box className={"filter-section"}>
            <p className={"filter-label"}>COVERAGE LIMIT</p>
            <select
              value={coverageLimit}
              onChange={(e) => setCoverageLimit(e.target.value)}
              className={"coverage-select"}
            >
              {COVERAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Box>

          <button className={"apply-btn"} onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </Box>

        <Box className={"packages-content"}>
          <Box className={"results-bar"}>
            <span className={"results-count"}>
              Showing <strong>{total}</strong> result{total !== 1 ? "s" : ""}
            </span>
            <Box className={"sort-box"}>
              <span className={"sort-label"}>SORT BY:</span>
              <select
                className={"sort-select"}
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Box>
          </Box>

          {loading ? (
            <Box className={"packages-grid"}>
              {[...Array(6)].map((_, i) => (
                <Box key={i} className={"pkg-card skeleton"}>
                  <Box className={"card-img-wrap skeleton-img"} />
                  <Box className={"card-body"}>
                    <Box
                      className={"skeleton-line"}
                      style={{ width: "70%", height: 18 }}
                    />
                    <Box
                      className={"skeleton-line"}
                      style={{ width: "40%", height: 28, marginTop: 8 }}
                    />
                    <Box
                      className={"skeleton-line"}
                      style={{ width: "90%", height: 14, marginTop: 8 }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : packages.length === 0 ? (
            <Box className={"empty-state"}>
              <ShieldOutlinedIcon className={"empty-icon"} />
              <p>No insurance packages found.</p>
              <span>Try adjusting your filters.</span>
            </Box>
          ) : (
            <Box className={"packages-grid"}>
              {packages.map((pkg) => {
                const liked = pkg.meLiked?.[0]?.myFavorite;
                return (
                  <Box
                    key={pkg._id}
                    className={"pkg-card"}
                    onClick={() => router.push(`/packages/${pkg._id}`)}
                  >
                    <Box className={"card-img-wrap"}>
                      <Box
                        className={"card-img"}
                        style={{
                          backgroundImage: `url(${getImage(pkg.packageImages)})`,
                        }}
                      />
                      <span
                        className={`type-badge type-${pkg.packageType.toLowerCase()}`}
                      >
                        {typeLabel(pkg.packageType)}
                      </span>
                      {pkg.packageRank != null && pkg.packageRank <= 3 && (
                        <span className={"top-badge"}>TOP</span>
                      )}
                    </Box>
                    <Box className={"card-body"}>
                      <p className={"card-title"}>{pkg.packageTitle}</p>
                      <Box className={"card-price"}>
                        <span className={"price-amount"}>
                          ${pkg.packagePrice.toLocaleString()}
                        </span>
                        <span className={"price-unit"}>/ month</span>
                      </Box>
                      {(pkg.packageCoverageLimit != null ||
                        pkg.packageMinAge != null) && (
                        <Box className={"card-meta"}>
                          {pkg.packageCoverageLimit != null && (
                            <span className={"meta-item"}>
                              <ShieldOutlinedIcon />
                              Cov: {formatCoverage(pkg.packageCoverageLimit)}
                            </span>
                          )}
                          {pkg.packageMinAge != null && (
                            <span className={"meta-item"}>
                              <PersonOutlinedIcon />
                              Ages: {pkg.packageMinAge}–
                              {pkg.packageMaxAge ?? "∞"}
                            </span>
                          )}
                        </Box>
                      )}
                      <Box className={"card-stats"}>
                        <span className={"stat"}>
                          <VisibilityOutlinedIcon />
                          {formatCount(pkg.packageViews)}
                        </span>
                        <button
                          className={`stat like-btn${liked ? " liked" : ""}`}
                          onClick={(e) => handleToggleLike(e, pkg._id)}
                        >
                          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          {formatCount(pkg.packageLikes)}
                        </button>
                        <span className={"stat"}>
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
            <Box className={"pagination"}>
              <button
                className={"pg-btn"}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeftIcon />
              </button>
              {buildPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`d${i}`} className={"pg-dots"}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`pg-btn${page === p ? " active" : ""}`}
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                className={"pg-btn"}
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
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
