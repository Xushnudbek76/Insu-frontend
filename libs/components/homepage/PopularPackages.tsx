import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';

const PopularPackages = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'popular-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Popular Packages</span>
					</Stack>
					<Stack className={'card-box'}>
						<Box component={'div'} className={'empty-list'}>
							No popular packages yet
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'popular-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Popular Packages</span>
							<p>Popularity is based on views</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<span>See All Packages</span>
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Box component={'div'} className={'empty-list'}>
							No popular packages yet
						</Box>
					</Stack>
					<Stack className={'pagination-box'}>
						<div className={'swiper-popular-pagination'}></div>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PopularPackages;
