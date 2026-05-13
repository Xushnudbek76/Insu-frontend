import React from 'react';
import { Stack, Box } from '@mui/material';
import NextLink from 'next/link';

const Advertisement = () => {
	return (
		<Stack className={'advertisement'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'ad-inner'}>
					<Box component={'div'} className={'ad-header'}>
						<span className={'ad-title'}>Protect what matters most</span>
						<p className={'ad-subtitle'}>
							Smart coverage with AI recommendations, trusted agents, and flexible
								plans.
						</p>
					</Box>
					<Box component={'div'} className={'ad-cards'}>
						<Box component={'div'} className={'ad-card'}>
							<span className={'ad-card-label'}>AI recommendations</span>
							<p className={'ad-card-desc'}>
								Let our AI suggest insurance that fits your budget and lifestyle.
							</p>
						</Box>
						<Box component={'div'} className={'ad-card'}>
							<span className={'ad-card-label'}>Flexible coverage</span>
							<p className={'ad-card-desc'}>
								Choose from auto, home, health and travel plans in just a few
									clicks.
							</p>
						</Box>
						<Box component={'div'} className={'ad-card'}>
							<span className={'ad-card-label'}>Trusted agents</span>
							<p className={'ad-card-desc'}>
								Work with verified experts whenever you want a human opinion.
							</p>
						</Box>
					</Box>
					<Box component={'div'} className={'ad-cta'}>
						<NextLink href={'/packages'} passHref legacyBehavior>
							<a className={'ad-btn'}>Browse popular insurance</a>
						</NextLink>
					</Box>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Advertisement;
