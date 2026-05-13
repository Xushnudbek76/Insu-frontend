import React from 'react';
import { Stack, Box } from '@mui/material';
import NextLink from 'next/link';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';

const HeaderFilter = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'header-filter'}>
				<Stack className={'hero-inner'}>
					<Box component={'div'} className={'hero-text'}>
						<strong className={'hero-title'}>
							Health insurance made for real life
						</strong>
						<p className={'hero-desc'}>
							We make insurance affordable, easy to understand, and tailored to your needs.
							Some plans start at $0.
						</p>
						<Box component={'div'} className={'hero-actions'}>
							<NextLink href={'/packages'} className={'hero-btn primary'}>
								Browse Insurance
							</NextLink>
							<NextLink href={'/account/join'} className={'hero-btn secondary'}>
								Find a Plan
							</NextLink>
						</Box>
					</Box>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'header-filter'}>
				<Stack className={'hero-inner'}>
					<Box component={'div'} className={'hero-text'}>
						<strong className={'hero-title'}>
							Health insurance made for real life
						</strong>
						<p className={'hero-desc'}>
							We don’t just offer health insurance. We make sure it’s affordable,
							easy to understand, and covers the care you really need,
							whenever you need it. And yes, some plans start at $0.
						</p>
						<Box component={'div'} className={'hero-actions'}>
							<NextLink href={'/packages'} className={'hero-btn primary'}>
								Browse Insurance
							</NextLink>
							<NextLink href={'/account/join'} className={'hero-btn secondary'}>
								Find a plan
							</NextLink>
						</Box>
					</Box>
					<Box component={'div'} className={'hero-images'}>
						<Box component={'div'} className={'img-col left-col'}>
							<img
								className={'img-card top'}
								src={'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=480&h=280&fit=crop'}
								alt={'car insurance'}
							/>
							<img
								className={'img-card bottom'}
								src={'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=480&h=200&fit=crop'}
								alt={'home insurance'}
							/>
						</Box>
						<Box component={'div'} className={'img-col right-col'}>
							<img
								className={'img-card full'}
								src={'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=380&h=500&fit=crop'}
								alt={'personal insurance'}
							/>
						</Box>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default HeaderFilter;
