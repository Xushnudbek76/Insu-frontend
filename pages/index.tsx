import { NextPage } from 'next';
import { Stack } from '@mui/material';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import withLayoutMain from '@/layout/LayoutHome';
import InsuranceAdviser from '@/libs/components/homepage/InsuranceAdviser';
import PopularPackages from '@/libs/components/homepage/PopularPackages';
import Advertisement from '@/libs/components/homepage/Advertisement';
import HomeComments from '@/libs/components/homepage/HomeComments';
import BoardArticles from '@/libs/components/homepage/BoardArticles';
import Header from '@/libs/components/homepage/Header';
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
				<Header />
				<InsuranceAdviser />
				<PopularPackages />
				<Advertisement />
				<HomeComments />
				<BoardArticles />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<Header />
				<InsuranceAdviser />
				<PopularPackages />
				<Advertisement />
				<HomeComments />
				<BoardArticles />
			</Stack>
		);
	}
};

export default withLayoutMain(HomePage);
