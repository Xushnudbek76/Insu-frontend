import { NextPage } from 'next';
import { Stack } from '@mui/material';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import withLayoutMain from '@/layout/LayoutHome';
import TrendPackages from '@/libs/components/homepage/TrendPackages';
import PopularPackages from '@/libs/components/homepage/PopularPackages';
import Advertisement from '@/libs/components/homepage/Advertisement';
import TopAgents from '@/libs/components/homepage/TopAgents';
import HeaderFilter from '@/libs/components/homepage/HeaderFilter';

const HomePage: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<HeaderFilter />
				<TrendPackages />
				<PopularPackages />
				<Advertisement />
				<TopAgents />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<HeaderFilter />
				<TrendPackages />
				<PopularPackages />
				<Advertisement />
				<TopAgents />
			</Stack>
		);
	}
};

export default withLayoutMain(HomePage);
