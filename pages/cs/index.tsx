import { NextPage } from 'next';
import NextLink from 'next/link';
import { Box, Stack } from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import withLayoutMain from '@/layout/LayoutHome';

const SUPPORT_CARDS = [
  {
    icon: AssignmentTurnedInOutlinedIcon,
    titleKey: 'Policy Applications',
    textKey: 'Track applications, understand duplicate policy limits, and learn what happens after you apply.',
  },
  {
    icon: HealthAndSafetyOutlinedIcon,
    titleKey: 'Claims & Coverage',
    textKey: 'Get help understanding coverage limits, claim steps, and policy protection details.',
  },
  {
    icon: ManageAccountsOutlinedIcon,
    titleKey: 'Account Help',
    textKey: 'Resolve login, registration, profile, and language switching issues quickly.',
  },
  {
    icon: SupportAgentOutlinedIcon,
    titleKey: 'Agent Support',
    textKey: 'Find out how to contact agents, review profiles, and compare active listings.',
  },
];

const FAQ_ITEMS = [
  {
    questionKey: 'How do I apply for an insurance package?',
    answerKey: 'Open a package detail page and click Apply Now. You must be logged in before submitting an application.',
  },
  {
    questionKey: 'Why can I not apply for the same package again?',
    answerKey: 'The system allows one active policy per package. If you already have an active policy, the API blocks duplicates.',
  },
  {
    questionKey: 'Where can I ask about a claim?',
    answerKey: 'Use the contact options on this page or speak with the agent attached to your policy for claim-specific guidance.',
  },
  {
    questionKey: 'Can I contact an agent before applying?',
    answerKey: 'Yes. Open an agent profile or package detail page to review the agent information before deciding.',
  },
  {
    questionKey: 'Why is my language not changing?',
    answerKey: 'Use the language menu in the top navigation. If the route was already open during setup, restart the dev server and refresh.',
  },
];

const CsPage: NextPage = () => {
  const { t } = useTranslation('common');

  return (
    <Stack className='cs-page'>
      <Stack className='cs-hero'>
        <Box className='cs-hero-grid' />
        <Stack className='cs-shell cs-hero-content'>
          <span>{t('Customer Support')}</span>
          <h1>{t('Help Center')}</h1>
          <p>{t('Home / CS')}</p>
          <strong>{t('Find answers about insurance applications, policies, claims, and agent support.')}</strong>
        </Stack>
      </Stack>

      <Stack className='cs-shell cs-main'>
        <Stack className='cs-section-head'>
          <span>{t('Support Desk')}</span>
          <h2>{t('How can we help?')}</h2>
          <p>{t('Choose the topic that best matches your question and get clear next steps.')}</p>
        </Stack>

        <Box className='cs-support-grid'>
          {SUPPORT_CARDS.map((card) => {
            const Icon = card.icon;

            return (
              <Stack key={card.titleKey} className='cs-support-card'>
                <Box className='cs-card-icon'>
                  <Icon />
                </Box>
                <h3>{t(card.titleKey)}</h3>
                <p>{t(card.textKey)}</p>
              </Stack>
            );
          })}
        </Box>

        <Box className='cs-content-grid'>
          <Stack className='cs-faq-panel'>
            <Stack className='cs-panel-title'>
              <span>{t('Frequently Asked Questions')}</span>
              <h2>{t('Quick answers')}</h2>
            </Stack>

            <Stack className='cs-faq-list'>
              {FAQ_ITEMS.map((item, index) => (
                <Stack key={item.questionKey} className='cs-faq-item'>
                  <Box className='cs-faq-number'>{String(index + 1).padStart(2, '0')}</Box>
                  <Stack>
                    <h3>{t(item.questionKey)}</h3>
                    <p>{t(item.answerKey)}</p>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Stack className='cs-contact-panel'>
            <span className='cs-contact-kicker'>{t('Still need help?')}</span>
            <h2>{t('Contact our support team')}</h2>
            <p>{t('Send us your question and our support team will guide you to the right next step.')}</p>

            <Stack className='cs-contact-methods'>
              <a href='mailto:support@insu.ai' className='cs-contact-row'>
                <MailOutlineOutlinedIcon />
                <Stack>
                  <span>{t('Email Support')}</span>
                  <strong>support@insu.ai</strong>
                </Stack>
              </a>
              <Box className='cs-contact-row'>
                <PhoneOutlinedIcon />
                <Stack>
                  <span>{t('Phone')}</span>
                  <strong>+1 (800) 555-0199</strong>
                </Stack>
              </Box>
              <Box className='cs-contact-row'>
                <ForumOutlinedIcon />
                <Stack>
                  <span>{t('Business Hours')}</span>
                  <strong>{t('Mon - Fri, 9:00 AM - 6:00 PM')}</strong>
                </Stack>
              </Box>
            </Stack>

            <NextLink href='/community' passHref legacyBehavior>
              <a className='cs-community-link'>
                {t('Ask the community')}
                <ArrowForwardOutlinedIcon />
              </a>
            </NextLink>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};

export const getStaticProps = async ({ locale = 'en' }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default withLayoutMain(CsPage);
