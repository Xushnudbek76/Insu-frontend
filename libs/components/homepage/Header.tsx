import React from 'react';
import { Stack, Box } from '@mui/material';
import NextLink from 'next/link';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next/pages';

const Header = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device === 'mobile') {
		return (
			<Stack className={'header-filter'}>
				<Stack className={'hero-inner'}>
					<Box component={'div'} className={'hero-text'}>
						<strong className={'hero-title'}>
							{t('AI insurance made for real life')}
						</strong>
						<p className={'hero-desc'}>
							{t('We make insurance affordable, easy to understand, and tailored to your needs. Some plans start at $0.')}
						</p>
						<Box component={'div'} className={'hero-actions'}>
							<NextLink href={'/packages'} className={'hero-btn primary'}>
								{t('Browse Insurance')}
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
							{t('Health insurance made for real life')}
						</strong>
						<p className={'hero-desc'}>
							{t('We do not just offer health insurance. We make sure it is affordable, easy to understand, and covers the care you really need, whenever you need it. And yes, some plans start at $0.')}
						</p>
						<Box component={'div'} className={'hero-actions'}>
							<NextLink href={'/packages'} className={'hero-btn primary'}>
								{t('Browse Insurance')}
							</NextLink>
							<NextLink href={'/#insurance-adviser'} className={'hero-btn secondary'}>
								{t('Find a plan')}
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
									alt={t('car insurance')}
								/>
							</Box>
							<Box component={'div'} className={'hero-card home-card'}>
								<Box
									component={'img'}
									className={'hero-card-image'}
									src={'/img/hero-img/home.webp'}
									alt={t('home insurance')}
								/>
							</Box>
						</Box>
						<Box component={'div'} className={'img-col right-col'}>
							<Box component={'div'} className={'hero-card health-card'}>
								<Box
									component={'img'}
									className={'hero-card-image'}
									src={'/img/hero-img/health.webp'}
									alt={t('health insurance')}
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
