import InformationPage from '@/libs/components/InformationPage';
import withLayoutMain from '@/layout/LayoutHome';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

export const getStaticProps = async ({ locale = 'en' }: { locale?: string }) => ({ props: await serverSideTranslations(locale, ['common']) });

function AboutPage() {
  return <InformationPage title="About INSU" intro="A simpler way to explore insurance and talk through your options with an agent." sections={[
    { heading: 'Compare your options', text: 'Browse health, auto, home and travel plans. Use filters or the adviser to build a shortlist, then review the details of each plan.' },
    { heading: 'Start a conversation', text: 'Choose a plan or an agent to start a private conversation. Ask about coverage, exclusions, eligibility and the documents needed before making a decision.' },
    { heading: 'You decide with your agent', text: 'Agents arrange offers and payments directly with clients. INSU does not collect insurance payments on this website. The policy documents and issuing provider determine the actual cover.' },
    { heading: 'Stay organized', text: 'Your account brings together saved plans, agent conversations and policy information. The help center explains how these features work.' },
  ]} />;
}

export default withLayoutMain(AboutPage);
