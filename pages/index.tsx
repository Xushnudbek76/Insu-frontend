import { NextPage } from 'next';
import { Stack } from '@mui/material';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import withLayoutMain from '@/layout/LayoutHome';
import TrendPackages from '@/libs/components/homepage/TrendPackages';
import PopularPackages from '@/libs/components/homepage/PopularPackages';
import Advertisement from '@/libs/components/homepage/Advertisement';
import HomeComments from '@/libs/components/homepage/HomeComments';
import BoardArticles from '@/libs/components/homepage/BoardArticles';
import HeaderFilter from '@/libs/components/homepage/HeaderFilter';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

export const getStaticProps = async ({ locale = 'en' }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const HomePage: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<HeaderFilter />
				<TrendPackages />
				<PopularPackages />
				<Advertisement />
				<HomeComments />
				<BoardArticles />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<HeaderFilter />
				<TrendPackages />
				<PopularPackages />
				<Advertisement />
				<HomeComments />
				<BoardArticles />
			</Stack>
		);
	}
};

export default withLayoutMain(HomePage);
