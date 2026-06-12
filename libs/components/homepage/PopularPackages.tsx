import React, { useMemo } from 'react';
import { Stack, Box, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useQuery, useMutation } from '@apollo/client/react';
import { useTranslation } from 'next-i18next/pages';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { GET_PACKAGES } from '@/apollo/user/query';
import { LIKE_TARGET_PACKAGE } from '@/apollo/package/mutation';
import { userVar } from '@/apollo/store';
import { getMeLiked, useLikeToggleMap } from '@/libs/hooks/useLikeToggle';
import type { LikeState } from '@/libs/types/common';
import { sweetMixinErrorAlert } from '@/libs/sweetAlert';
import { toAssetUrl } from '@/libs/api';

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
	const { t } = useTranslation('common');

	const { data, loading, error } = useQuery<GetPackagesResponse>(GET_PACKAGES, {
		variables: {
			input: {
				page: 1,
				limit: device === 'mobile' ? 3 : 6,
				sort: 'packageViews',
				direction: 'DESC',
				search: {},
			},
		},
		fetchPolicy: 'cache-and-network',
	});

	const [likePackage] = useMutation<{ likeTargetPackage: PopularPackage }>(
		LIKE_TARGET_PACKAGE,
	);

	const packages = data?.getPackages?.list ?? [];
	const getPackageImage = (images?: string[] | null) =>
		toAssetUrl(images?.[0]) ?? '/img/placeholder-article.svg';

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
		onUnauthenticated: () => sweetMixinErrorAlert(t('Please login to like packages.')),
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
			console.error('Error, likeTargetPackage', error);
			await sweetMixinErrorAlert(message);
		},
		errorMessage: t('Could not update favorites.'),
	});

	const handleCardClick = (id: string) => {
		if (!id) return;
		router.push(`/packages/${id}`);
	};

	const handleToggleLike = (id: string) => {
		void packageLikes.toggle(id);
	};

	const hasPackages = packages && packages.length > 0;

	if (device === 'mobile') {
		return (
			<Stack className={'popular-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>{t('Popular Insurance')}</span>
					</Stack>
					<Stack className={'card-box'}>
						{loading && (
							<Box component={'div'} className={'empty-list'}>
								{t('Loading popular insurance...')}
							</Box>
						)}
						{!loading && error && (
							<Box component={'div'} className={'empty-list'}>
								{t('Could not load popular packages. Please try again later.')}
							</Box>
						)}
						{!loading && !error && hasPackages && (
							<Stack className={'popular-grid'}>
								{packages.map((pkg) => {
									const likeState = packageLikes.getState(pkg._id);
									return (
										<Box
											key={pkg._id}
											component={'div'}
											className={'package-card'}
											onClick={() => handleCardClick(pkg._id)}
										>
											<Box className={'package-image-wrap'}>
												<Box
													component='img'
													src={getPackageImage(pkg.packageImages)}
													alt={pkg.packageTitle}
													className={'package-image'}
												/>
											</Box>
											<span className={'package-type'}>{t(pkg.packageType)}</span>
											<strong className={'package-name'}>{pkg.packageTitle}</strong>
											{pkg.packageDesc && (
												<p className={'package-desc'}>{pkg.packageDesc}</p>
											)}
											<span className={'package-price'}>
												${pkg.packagePrice.toLocaleString()} {t('/ month')}
											</span>
											<Box component={'div'} className={'package-footer'}>
												<span className={'package-meta'}>
													{typeof pkg.packageViews === 'number'
														? t('views count', { count: pkg.packageViews.toLocaleString() })
														: t('New insurance')}
												</span>
												<IconButton
													className={'like-btn'}
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														void handleToggleLike(pkg._id);
													}}
												>
													<FavoriteIcon
														className={
															'like-icon' + (likeState.liked ? ' liked' : '')
														}
													/>
												</IconButton>
											</Box>
										</Box>
										);
									})}
							</Stack>
						)}
						{!loading && !error && !hasPackages && (
							<Box component={'div'} className={'empty-list'}>
								{t('No popular insurance yet')}
							</Box>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'popular-packages'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span>{t('Popular Insurance')}</span>
						<p>{t('Popularity is based on views')}</p>
					</Box>
					<Box component={'div'} className={'right'}>
						<div className={'more-box'}>
							<NextLink href={'/packages'}>{t('See All Insurance')}</NextLink>
						</div>
					</Box>
				</Stack>
				<Stack className={'card-box'}>
					{loading && (
						<Box component={'div'} className={'empty-list'}>
							{t('Loading popular insurance...')}
						</Box>
					)}
					{!loading && error && (
						<Box component={'div'} className={'empty-list'}>
							{t('Could not load popular packages. Please try again later.')}
						</Box>
					)}
					{!loading && !error && hasPackages && (
						<Stack className={'popular-grid'}>
							{packages.map((pkg) => {
								const likeState = packageLikes.getState(pkg._id);
								return (
									<Box
										key={pkg._id}
										component={'div'}
										className={'package-card'}
										onClick={() => handleCardClick(pkg._id)}
									>
										<Box className={'package-image-wrap'}>
											<Box
												component='img'
												src={getPackageImage(pkg.packageImages)}
												alt={pkg.packageTitle}
												className={'package-image'}
											/>
										</Box>
										<span className={'package-type'}>{t(pkg.packageType)}</span>
										<strong className={'package-name'}>{pkg.packageTitle}</strong>
										{pkg.packageDesc && (
											<p className={'package-desc'}>{pkg.packageDesc}</p>
										)}
										<span className={'package-price'}>
											${pkg.packagePrice.toLocaleString()} {t('/ month')}
										</span>
										<Box component={'div'} className={'package-footer'}>
											<span className={'package-meta'}>
												{typeof pkg.packageViews === 'number'
													? t('views count', { count: pkg.packageViews.toLocaleString() })
													: t('New insurance')}
											</span>
											<IconButton
												className={'like-btn'}
												size="small"
												onClick={(event) => {
													event.stopPropagation();
													void handleToggleLike(pkg._id);
												}}
											>
												<FavoriteIcon
													className={
														'like-icon' + (likeState.liked ? ' liked' : '')
													}
												/>
											</IconButton>
										</Box>
									</Box>
								);
							})}
						</Stack>
					)}
					{!loading && !error && !hasPackages && (
						<Box component={'div'} className={'empty-list'}>
							{t('No popular insurance yet')}
						</Box>
					)}
				</Stack>
				<Stack className={'pagination-box'}>
					<div className={'swiper-popular-pagination'}></div>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default PopularPackages;
