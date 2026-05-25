import React from 'react';
import { Stack, Box } from '@mui/material';
import NextLink from 'next/link';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';

const Header = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'header-filter'}>
				<Stack className={'hero-inner'}>
					<Box component={'div'} className={'hero-text'}>
						<strong className={'hero-title'}>
							AI insurance made for real life
						</strong>
						<p className={'hero-desc'}>
							We make insurance affordable, easy to understand, and tailored to your needs.
							Some plans start at $0.
						</p>
						<Box component={'div'} className={'hero-actions'}>
							<NextLink href={'/packages'} className={'hero-btn primary'}>
								Browse Insurance
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
							<Box component={'div'} className={'hero-card car-card'}>
								<Box
									component={'img'}
									className={'hero-card-image'}
									src={'/img/hero-img/car.webp'}
									alt={'car insurance'}
								/>
							</Box>
							<Box component={'div'} className={'hero-card home-card'}>
								<Box
									component={'img'}
									className={'hero-card-image'}
									src={'/img/hero-img/home.webp'}
									alt={'home insurance'}
								/>
							</Box>
						</Box>
						<Box component={'div'} className={'img-col right-col'}>
							<Box component={'div'} className={'hero-card health-card'}>
								<Box
									component={'img'}
									className={'hero-card-image'}
									src={'/img/hero-img/health.webp'}
									alt={'health insurance'}
								/>
							</Box>
						</Box>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default Header;
