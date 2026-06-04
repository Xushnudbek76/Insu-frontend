import React from 'react';
import { Stack, Box } from '@mui/material';
import NextLink from 'next/link';
import { useTranslation } from 'next-i18next/pages';

const Advertisement = () => {
	const { t } = useTranslation('common');

	return (
		<Stack className={'advertisement'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'ad-inner'}>
					<Box component={'div'} className={'ad-header'}>
						<span className={'ad-title'}>{t('Protect what matters most')}</span>
						<p className={'ad-subtitle'}>
							{t('Smart coverage with AI recommendations, trusted agents, and flexible plans.')}
						</p>
					</Box>
					<Box component={'div'} className={'ad-cards'}>
						<Box component={'div'} className={'ad-card'}>
							<span className={'ad-card-label'}>{t('AI recommendations')}</span>
							<p className={'ad-card-desc'}>
								{t('Let our AI suggest insurance that fits your budget and lifestyle.')}
							</p>
						</Box>
						<Box component={'div'} className={'ad-card'}>
							<span className={'ad-card-label'}>{t('Flexible coverage')}</span>
							<p className={'ad-card-desc'}>
								{t('Choose from auto, home, health and travel plans in just a few clicks.')}
							</p>
						</Box>
						<Box component={'div'} className={'ad-card'}>
							<span className={'ad-card-label'}>{t('Trusted agents')}</span>
							<p className={'ad-card-desc'}>
								{t('Work with verified experts whenever you want a human opinion.')}
							</p>
						</Box>
					</Box>
					<Box component={'div'} className={'ad-cta'}>
						<NextLink href={'/packages'} passHref legacyBehavior>
							<a className={'ad-btn'}>{t('Browse popular insurance')}</a>
						</NextLink>
					</Box>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Advertisement;
