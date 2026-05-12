import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';

const TrendPackages = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'trend-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Trend Packages</span>
					</Stack>
					<Stack className={'card-box'}>
						<Box component={'div'} className={'empty-list'}>
							No trend packages yet
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'trend-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Trend Packages</span>
							<p>Trending is based on likes</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<div className={'swiper-trend-pagination'}></div>
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Box component={'div'} className={'empty-list'}>
							No trend packages yet
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default TrendPackages;
