import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';

const TopAgents = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top Agents</span>
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'empty-list'}>
							No agents yet
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top Agents</span>
							<p>Our top agents are always ready to serve you</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<span>See All Agents</span>
							</div>
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'card-wrapper'}>
							<Box component={'div'} className={'empty-list'}>
								No agents yet
							</Box>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default TopAgents;
