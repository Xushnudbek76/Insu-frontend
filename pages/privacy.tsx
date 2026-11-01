import InformationPage from '@/libs/components/InformationPage';
import withLayoutMain from '@/layout/LayoutHome';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

export const getStaticProps = async ({ locale = 'en' }: { locale?: string }) => ({ props: await serverSideTranslations(locale, ['common']) });

function PrivacyPage() {
  return <InformationPage title="Privacy information" intro="Understand what you share when you use INSU and which parts of the service are public." sections={[
    { heading: 'Account and activity data', text: 'INSU stores the account details you provide, such as your username, phone number, profile information and uploaded images. It also stores activity needed for saved plans, comments, conversations, policy offers and claims. Your own profile page lets you review and edit your profile details.' },
    { heading: 'Public profiles and community spaces', text: 'Profile names, profile photos, public posts, comments and community chat messages can be visible to other visitors. Account phone and address fields are restricted to the account owner and administrators. Do not use public community spaces for private documents or payment details.' },
    { heading: 'Private agent conversations', text: 'Private conversations are available to their participants and authorized administrators. Information you send to an agent is shared with that agent to discuss your request. Share only what is needed for the conversation.' },
    { heading: 'Sign-in and storage', text: 'INSU keeps your sign-in session in a secure, HttpOnly cookie that page scripts cannot read. Sessions expire after 12 hours. Signing out revokes the session and clears its cookie. A separate security cookie helps protect requests against forgery. The application uses cloud infrastructure and a database to store and serve account and application data.' },
    { heading: 'AI adviser', text: 'Information entered into the adviser may be sent to an AI service to generate suggestions when that service is configured. Use general requirements and avoid entering sensitive personal information. Recommendations do not require payment-card details.' },
  ]} />;
}

export default withLayoutMain(PrivacyPage);
