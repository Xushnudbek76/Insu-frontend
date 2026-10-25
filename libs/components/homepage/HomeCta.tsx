import React from 'react';
import { Stack, Box } from '@mui/material';
import NextLink from 'next/link';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Trans, useTranslation } from 'next-i18next/pages';

const HomeCta = () => {
	const { t } = useTranslation('common');

	return (
		<Stack className={'home-cta'}>
			<Stack className={'container'}>
				<h2>
					<Trans
						t={t}
						i18nKey={'final cta title html'}
						defaults={'Ready to find <i>your plan?</i>'}
						components={{ i: <i /> }}
					/>
				</h2>
				<p>
					{t('Compare plans on your own, or answer a few questions and let the adviser shortlist some for you.')}
				</p>
				<Box component={'div'} className={'home-cta-actions'}>
					<NextLink href={'/packages'} className={'home-btn primary'}>
						{t('Browse Insurance')}
						<ArrowForwardRoundedIcon />
					</NextLink>
					<NextLink href={'/#insurance-adviser'} className={'home-cta-link'}>
						{t('Find a plan')}
					</NextLink>
				</Box>
			</Stack>
		</Stack>
	);
};

export default HomeCta;
