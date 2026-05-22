import NextLink from 'next/link';
import { Box, Stack } from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

interface SupportCard {
  icon: SvgIconComponent;
  titleKey: string;
  textKey: string;
}

interface FaqItem {
  questionKey: string;
  answerKey: string;
}

interface MobileCsPageProps {
  t: (key: string) => string;
  supportCards: SupportCard[];
  faqItems: FaqItem[];
}

const MobileCsPage = ({ t, supportCards, faqItems }: MobileCsPageProps) => (
  <Stack className='mobile-cs-page'>
    <Stack className='mobile-cs-hero'>
      <span>{t('Customer Support')}</span>
      <h1>{t('Help Center')}</h1>
      <p>{t('Find answers about insurance applications, policies, claims, and agent support.')}</p>
    </Stack>

    <Stack className='mobile-cs-section'>
      <h2>{t('How can we help?')}</h2>
      <Box className='mobile-cs-card-grid'>
        {supportCards.map((card) => {
          const Icon = card.icon;
          return (
            <Stack key={card.titleKey} className='mobile-cs-card'>
              <Box className='mobile-cs-icon'>
                <Icon />
              </Box>
              <strong>{t(card.titleKey)}</strong>
              <p>{t(card.textKey)}</p>
            </Stack>
          );
        })}
      </Box>
    </Stack>

    <Stack className='mobile-cs-section mobile-cs-faq'>
      <h2>{t('Quick answers')}</h2>
      {faqItems.map((item, index) => (
        <Stack key={item.questionKey} className='mobile-cs-faq-item'>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div>
            <strong>{t(item.questionKey)}</strong>
            <p>{t(item.answerKey)}</p>
          </div>
        </Stack>
      ))}
    </Stack>

    <Stack className='mobile-cs-contact'>
      <span>{t('Still need help?')}</span>
      <h2>{t('Contact our support team')}</h2>
      <a href='mailto:support@insu.ai'>support@insu.ai</a>
      <strong>+1 (800) 555-0199</strong>
      <small>{t('Mon - Fri, 9:00 AM - 6:00 PM')}</small>
      <NextLink href='/community' className='mobile-cs-link'>
        {t('Ask the community')}
        <ArrowForwardOutlinedIcon />
      </NextLink>
    </Stack>
  </Stack>
);

export default MobileCsPage;
