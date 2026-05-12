import React from 'react';
import { Stack, Box } from '@mui/material';
import NextLink from 'next/link';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';

const HeaderFilter = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'header-filter'}>
				<Stack className={'container'}>
					<Box component={'div'} className={'info'}>
						<span className={'hero-label'}>Insurance-AI Platform</span>
						<strong className={'hero-title'}>
							Find the right insurance coverage for you
						</strong>
						<p className={'hero-desc'}>
							Smart marketplace powered by AI. Compare plans, connect with agents,
							and manage your policies in one place.
						</p>
						<Box component={'div'} className={'hero-actions'}>
							<NextLink href={'/packages'} className={'hero-btn primary'}>
								Browse Packages
							</NextLink>
							<NextLink href={'/account/join'} className={'hero-btn secondary'}>
								Login / Register
							</NextLink>
						</Box>
					</Box>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'header-filter'}>
				<Stack className={'container'}>
					<Box component={'div'} className={'info'}>
						<span className={'hero-label'}>Insurance-AI Platform</span>
						<strong className={'hero-title'}>
							Find the right insurance coverage for you
						</strong>
						<p className={'hero-desc'}>
							Smart marketplace powered by AI. Compare plans, connect with agents,
							and manage your policies in one place.
						</p>
						<Box component={'div'} className={'hero-actions'}>
							<NextLink href={'/packages'} className={'hero-btn primary'}>
								Browse Packages
							</NextLink>
							<NextLink href={'/account/join'} className={'hero-btn secondary'}>
								Login / Register
							</NextLink>
						</Box>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default HeaderFilter;
