import React from 'react';
import { Stack, Box } from '@mui/material';
import NextLink from 'next/link';
import { Trans, useTranslation } from 'next-i18next/pages';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

const FEATURES = [
	{
		Icon: AutoAwesomeOutlinedIcon,
		label: 'AI recommendations',
		desc: 'Let our AI suggest insurance that fits your budget and lifestyle.',
	},
	{
		Icon: TuneRoundedIcon,
		label: 'Flexible coverage',
		desc: 'Choose from auto, home, health and travel plans in just a few clicks.',
	},
	{
		Icon: VerifiedUserOutlinedIcon,
		label: 'Trusted agents',
		desc: 'Work with verified experts whenever you want a human opinion.',
	},
];

const Advertisement = () => {
	const { t } = useTranslation('common');

	return (
		<Stack className={'advertisement'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'ad-inner'}>
					<Box component={'div'} className={'ad-header'}>
						<span className={'section-tag'}>{t('Why INSU')}</span>
						<h2 className={'ad-title'}>
							<Trans
								t={t}
								i18nKey={'protect title html'}
								defaults={'Protect what <i>matters most</i>'}
								components={{ i: <i /> }}
							/>
						</h2>
						<p className={'ad-subtitle'}>
							{t('Smart coverage with AI recommendations, trusted agents, and flexible plans.')}
						</p>
						<NextLink href={'/packages'} className={'home-btn dark'}>
							{t('Browse popular insurance')}
							<ArrowForwardRoundedIcon />
						</NextLink>
					</Box>
					<Box component={'div'} className={'ad-features'}>
						{FEATURES.map(({ Icon, label, desc }) => (
							<Box key={label} component={'div'} className={'ad-feature'}>
								<Icon className={'ad-feature-icon'} />
								<h3 className={'ad-feature-label'}>{t(label)}</h3>
								<p className={'ad-feature-desc'}>{t(desc)}</p>
							</Box>
						))}
					</Box>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Advertisement;
