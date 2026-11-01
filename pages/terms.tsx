import InformationPage from '@/libs/components/InformationPage';
import withLayoutMain from '@/layout/LayoutHome';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

export const getStaticProps = async ({ locale = 'en' }: { locale?: string }) => ({ props: await serverSideTranslations(locale, ['common']) });

function TermsPage() {
  return <InformationPage title="Using INSU" intro="How browsing, agent conversations and account features work on INSU." sections={[
    { heading: 'Browsing and recommendations', text: 'Plan listings and AI suggestions help you explore options. They do not confirm eligibility, bind an insurer, or replace the policy documents. Confirm the current price, coverage and exclusions with the agent and issuing provider.' },
    { heading: 'Offers and payment', text: 'Payments are arranged directly with the agent outside this website. Review the offer and provider details before proceeding. A conversation or saved plan by itself does not activate insurance.' },
    { heading: 'Your account', text: 'Keep your account details accurate and your sign-in credentials private. Use your own account and do not try to access another person’s messages, policies or private information.' },
    { heading: 'Community participation', text: 'Community posts and the community chat room are public. Keep contributions relevant and respectful. Do not post someone else’s private information, impersonate another person, or upload harmful content. Administrators can moderate content and restrict accounts.' },
    { heading: 'Questions about the service', text: 'Visit the help center for guidance about accounts, agent conversations, policies and claims. Ask the agent or issuing provider about the terms of a particular insurance product.' },
  ]} />;
}

export default withLayoutMain(TermsPage);
