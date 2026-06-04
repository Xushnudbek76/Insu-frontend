import NextLink from 'next/link';
import { useTranslation } from 'next-i18next/pages';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');

  return (
    <footer id="footer">
      <div className="footer-inner">
        <div className="main">
          <div className="brand-col">
            <span className="logo">INSU</span>
            <p>
              {t('Smart insurance marketplace powered by AI. Discover tailored insurance, compare coverage, and manage your policies effortlessly.')}
            </p>
          </div>

          <div className="links-col">
            <div className="link-group">
              <strong>{t('Explore')}</strong>
              <NextLink href="/packages">{t('Insurance')}</NextLink>
              <NextLink href="/agents">{t('Agents')}</NextLink>
              <NextLink href="/community">{t('Community')}</NextLink>
            </div>

            <div className="link-group">
              <strong>{t('Support')}</strong>
              <NextLink href="/cs">{t('Help Center')}</NextLink>
              <a href="mailto:support@insu.ai">{t('Contact')}</a>
              <NextLink href="/about">{t('About')}</NextLink>
            </div>
          </div>
        </div>

        <div className="second">
          <span>{t('footer rights', { year: currentYear })}</span>
          <div className="footer-links">
            <NextLink href="/terms">{t('Terms')}</NextLink>
            <NextLink href="/privacy">{t('Privacy')}</NextLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
