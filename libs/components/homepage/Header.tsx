import React from 'react';
import { Stack, Box } from '@mui/material';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client/react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Trans, useTranslation } from 'next-i18next/pages';
import { GET_AGENTS, GET_PACKAGES } from '@/apollo/user/query';
import { getTotal } from '@/libs/utils/format';
import type { MetaCounter } from '@/libs/types/common';

// Unsplash photo-1642522029686-5485ea7e6042 (Unsplash License), saved locally at 2400px.
const HERO_PHOTO = '/img/hero-img/agent-desk.webp';

interface TotalOnly {
	metaCounter?: MetaCounter | MetaCounter[] | null;
}

const COUNT_INPUT = { page: 1, limit: 1, sort: 'createdAt', direction: 'DESC', search: {} };

const Header = () => {
	const { t } = useTranslation('common');

	// Only the totals are needed for the trust line above the headline
	const { data: agentsData } = useQuery<{ getAgents: TotalOnly }>(GET_AGENTS, {
		variables: { input: COUNT_INPUT },
		fetchPolicy: 'cache-and-network',
	});
	const { data: packagesData } = useQuery<{ getPackages: TotalOnly }>(GET_PACKAGES, {
		variables: { input: COUNT_INPUT },
		fetchPolicy: 'cache-and-network',
	});

	const agentTotal = getTotal(agentsData?.getAgents?.metaCounter);
	const planTotal = getTotal(packagesData?.getPackages?.metaCounter);

	const trustItems = [
		agentTotal > 0
			? t('trusted agents count', {
					count: agentTotal,
					defaultValue_one: '{{count}} trusted agent',
					defaultValue: '{{count}} trusted agents',
				})
			: null,
		planTotal > 0
			? t('insurance plans count', {
					count: planTotal,
					defaultValue_one: '{{count}} insurance plan',
					defaultValue: '{{count}} insurance plans',
				})
			: null,
	].filter(Boolean);

	return (
		<Stack className={'header-filter'}>
			<Box
				component={'section'}
				className={'hero-frame'}
				style={{ backgroundImage: `url('${HERO_PHOTO}')` }}
			>
				<Box component={'div'} className={'hero-content'}>
					{trustItems.length > 0 && <p className={'hero-trust'}>{trustItems.join(' · ')}</p>}
					<h1 className={'hero-title'}>
						<Trans
							t={t}
							i18nKey={'hero title html'}
							defaults={'Insurance that <i>fits your life.</i>'}
							components={{ i: <i /> }}
						/>
					</h1>
					<p className={'hero-desc'}>
						{t('Car, home, health and travel plans in plain words. Compare them yourself, or let our adviser find a few that fit.')}
					</p>
					<NextLink href={'/packages'} className={'home-btn primary hero-cta'}>
						{t('Browse Insurance')}
						<ArrowForwardRoundedIcon />
					</NextLink>
					<NextLink href={'/#insurance-adviser'} className={'hero-link'}>
						{t('Find a plan')}
					</NextLink>
				</Box>
			</Box>
		</Stack>
	);
};

export default Header;
