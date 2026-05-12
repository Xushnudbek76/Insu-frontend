import React from 'react';
import { Stack } from '@mui/material';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';

const Advertisement = () => {
	const device = useDeviceDetect();

	return (
		<Stack className={'advertisement'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<span className={device === 'mobile' ? '' : 'white'}>
						Protect what matters most
					</span>
					<p className={device === 'mobile' ? '' : 'white'}>
						Explore our AI-powered insurance packages tailored to your needs
					</p>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Advertisement;
