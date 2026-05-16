import React from 'react';
import { Stack, Box, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useQuery, useMutation } from '@apollo/client/react';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { GET_PACKAGES } from '@/apollo/user/query';
import { LIKE_TARGET_PACKAGE } from '@/apollo/package/mutation';
import { userVar } from '@/apollo/store';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
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
		{
			refetchQueries: [{ query: GET_PACKAGES, variables: {
				input: {
					page: 1,
					limit: device === 'mobile' ? 3 : 6,
					sort: 'packageViews',
					direction: 'DESC',
					search: {},
				},
			}}],
		}
	);

	const packages = data?.getPackages?.list ?? [];
	const getPackageImage = (images?: string[] | null) =>
		toAssetUrl(images?.[0]) ?? '/img/placeholder-article.svg';

	const handleCardClick = (id: string) => {
		if (!id) return;
		router.push(`/packages/${id}`);
	};

	const handleToggleLike = async (id: string) => {
		try {
			const currentUser = userVar();
			if (!currentUser?._id) {
				await sweetMixinErrorAlert('Please login to like packages.');
				return;
			}

			await likePackage({ variables: { packageId: id } });
			await sweetTopSuccessAlert('Updated your favorites.');
		} catch (err: any) {
			console.error('Error, likeTargetPackage', err);
			const message =
				err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ??
				err?.message ??
				'Could not update favorites.';
			await sweetMixinErrorAlert(message);
		}
	};

	const hasPackages = packages && packages.length > 0;

	if (device === 'mobile') {
		return (
			<Stack className={'popular-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Popular Insurance</span>
					</Stack>
					<Stack className={'card-box'}>
						{loading && (
							<Box component={'div'} className={'empty-list'}>
								Loading popular insurance...
							</Box>
						)}
						{!loading && error && (
							<Box component={'div'} className={'empty-list'}>
								Couldn't load popular packages. Please try again later.
							</Box>
						)}
						{!loading && !error && hasPackages && (
							<Stack className={'popular-grid'}>
								{packages.map((pkg) => {
									const liked = pkg.meLiked && pkg.meLiked[0]?.myFavorite;
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
											<span className={'package-type'}>{pkg.packageType}</span>
											<strong className={'package-name'}>{pkg.packageTitle}</strong>
											{pkg.packageDesc && (
												<p className={'package-desc'}>{pkg.packageDesc}</p>
											)}
											<span className={'package-price'}>
												${pkg.packagePrice.toLocaleString()} / month
											</span>
											<Box component={'div'} className={'package-footer'}>
												<span className={'package-meta'}>
													{typeof pkg.packageViews === 'number'
														? `${pkg.packageViews.toLocaleString()} views`
														: 'New insurance'}
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
															'like-icon' + (liked ? ' liked' : '')
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
								No popular insurance yet
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
						<span>Popular Insurance</span>
						<p>Popularity is based on views</p>
					</Box>
					<Box component={'div'} className={'right'}>
						<div className={'more-box'}>
							<NextLink href={'/packages'}>See All Insurance</NextLink>
						</div>
					</Box>
				</Stack>
				<Stack className={'card-box'}>
					{loading && (
						<Box component={'div'} className={'empty-list'}>
							Loading popular insurance...
						</Box>
					)}
					{!loading && error && (
						<Box component={'div'} className={'empty-list'}>
							Couldn't load popular packages. Please try again later.
						</Box>
					)}
					{!loading && !error && hasPackages && (
						<Stack className={'popular-grid'}>
							{packages.map((pkg) => {
								const liked = pkg.meLiked && pkg.meLiked[0]?.myFavorite;
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
										<span className={'package-type'}>{pkg.packageType}</span>
										<strong className={'package-name'}>{pkg.packageTitle}</strong>
										{pkg.packageDesc && (
											<p className={'package-desc'}>{pkg.packageDesc}</p>
										)}
										<span className={'package-price'}>
											${pkg.packagePrice.toLocaleString()} / month
										</span>
										<Box component={'div'} className={'package-footer'}>
											<span className={'package-meta'}>
												{typeof pkg.packageViews === 'number'
														? `${pkg.packageViews.toLocaleString()} views`
														: 'New insurance'}
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
														'like-icon' + (liked ? ' liked' : '')
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
							No popular insurance yet
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
