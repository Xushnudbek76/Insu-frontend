import React, { useMemo } from "react";
import { Stack, Box, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import { useTranslation } from "next-i18next/pages";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";
import { GET_PACKAGES } from "@/apollo/user/query";
import { LIKE_TARGET_PACKAGE } from "@/apollo/package/mutation";
import { userVar } from "@/apollo/store";
import { getMeLiked, useLikeToggleMap } from "@/libs/hooks/useLikeToggle";
import type { LikeState } from "@/libs/types/common";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { toAssetUrl } from "@/libs/api";
import { typeLabel } from "@/libs/components/packages/helpers";

const PLACEHOLDER_IMAGE = "/img/placeholder-article.svg";

interface PopularPackage {
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
  meLiked?: { myFavorite: boolean }[] | null;
}

interface GetPackagesResponse {
  getPackages: {
    list: PopularPackage[];
  };
}

const PopularPackages: React.FC = () => {
  const device = useDeviceDetect();
  const router = useRouter();
  const { t } = useTranslation("common");

  const { data, loading, error } = useQuery<GetPackagesResponse>(GET_PACKAGES, {
    variables: {
      input: {
        page: 1,
        limit: device === "mobile" ? 3 : 4,
        sort: "packageViews",
        direction: "DESC",
        search: {},
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const [likePackage] = useMutation<{ likeTargetPackage: PopularPackage }>(
    LIKE_TARGET_PACKAGE,
  );

  // A fresh `[]` on every render would re-run the like-state sync effect forever while loading.
  const packages = useMemo(() => data?.getPackages?.list ?? [], [data]);
  const getPackageImage = (images?: string[] | null) =>
    toAssetUrl(images?.[0]) ?? PLACEHOLDER_IMAGE;

  const packageLikeSourceStates = useMemo<Record<string, LikeState>>(
    () =>
      Object.fromEntries(
        packages.map((pkg) => [
          pkg._id,
          {
            liked: getMeLiked(pkg.meLiked),
            count: pkg.packageLikes ?? 0,
          },
        ]),
      ),
    [packages],
  );

  const packageLikes = useLikeToggleMap({
    sourceStates: packageLikeSourceStates,
    isAuthenticated: () => Boolean(userVar()?._id),
    onUnauthenticated: () =>
      sweetMixinErrorAlert(t("Please login to like packages.")),
    mutate: async (packageId, optimistic) => {
      const result = await likePackage({ variables: { packageId } });
      const updated = result.data?.likeTargetPackage;
      if (!updated) return null;

      return {
        liked: getMeLiked(updated.meLiked),
        count: updated.packageLikes ?? optimistic.count,
      };
    },
    onError: async (message, error) => {
      console.error("Error, likeTargetPackage", error);
      await sweetMixinErrorAlert(message);
    },
    errorMessage: t("Could not update favorites."),
  });

  const handleCardClick = (id: string) => {
    if (!id) return;
    router.push(`/packages/${id}`);
  };

  const handleToggleLike = (id: string) => {
    void packageLikes.toggle(id);
  };

  const hasPackages = packages && packages.length > 0;

  const renderCard = (pkg: PopularPackage) => {
    const likeState = packageLikes.getState(pkg._id);
    return (
      <Box
        key={pkg._id}
        component={"div"}
        className={"package-card"}
        onClick={() => handleCardClick(pkg._id)}
      >
        <Box className={"package-image-wrap"}>
          <Box
            component="img"
            src={getPackageImage(pkg.packageImages)}
            alt={pkg.packageTitle}
            className={"package-image"}
            onError={(event: React.SyntheticEvent<HTMLImageElement>) => {
              const image = event.currentTarget;
              if (!image.src.endsWith(PLACEHOLDER_IMAGE)) image.src = PLACEHOLDER_IMAGE;
            }}
          />
          <span className={"package-type"}>{t(typeLabel(pkg.packageType))}</span>
          <IconButton
            className={"like-btn" + (likeState.liked ? " liked" : "")}
            size="small"
            aria-label={t("Likes")}
            onClick={(event) => {
              event.stopPropagation();
              void handleToggleLike(pkg._id);
            }}
          >
            {likeState.liked ? (
              <FavoriteIcon className={"like-icon"} />
            ) : (
              <FavoriteBorderIcon className={"like-icon"} />
            )}
          </IconButton>
        </Box>
        <Box component={"div"} className={"package-body"}>
          <strong className={"package-name"}>{pkg.packageTitle}</strong>
          {pkg.packageDesc && (
            <p className={"package-desc"}>{pkg.packageDesc}</p>
          )}
          <Box component={"div"} className={"package-footer"}>
            <span className={"package-price"}>
              <b>${pkg.packagePrice.toLocaleString()}</b> {t("/ month")}
            </span>
            <span className={"package-meta"}>
              {typeof pkg.packageViews === "number"
                ? t("views count", {
                    count: pkg.packageViews.toLocaleString(),
                  })
                : t("New insurance")}
            </span>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Stack className={"popular-packages"}>
      <Stack className={"container"}>
        <Stack className={"info-box"}>
          <Box component={"div"} className={"left"}>
            <span className={"section-tag"}>{t("Insurance")}</span>
            <h2>{t("Popular Insurance")}</h2>
            <p>{t("Popularity is based on views")}</p>
          </Box>
          <Box component={"div"} className={"right"}>
            <NextLink href={"/packages"} className={"more-link"}>
              {t("See All Insurance")}
              <ArrowForwardRoundedIcon />
            </NextLink>
          </Box>
        </Stack>
        <Stack className={"card-box"}>
          {loading && (
            <Box component={"div"} className={"empty-list"}>
              {t("Loading popular insurance...")}
            </Box>
          )}
          {!loading && error && (
            <Box component={"div"} className={"empty-list"}>
              {t("Could not load popular packages. Please try again later.")}
            </Box>
          )}
          {!loading && !error && hasPackages && (
            <Stack className={"popular-grid"}>{packages.map(renderCard)}</Stack>
          )}
          {!loading && !error && !hasPackages && (
            <Box component={"div"} className={"empty-list"}>
              {t("No popular insurance yet")}
            </Box>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default PopularPackages;
