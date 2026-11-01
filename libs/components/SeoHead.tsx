import Head from 'next/head';
import { useRouter } from 'next/router';

const SITE_NAME = 'INSU';
const DEFAULT_TITLE = 'INSU | Insurance that fits your life';
const DEFAULT_DESCRIPTION =
  'Find health, auto, home and travel insurance in one place. Compare options, chat with an agent, and choose cover that fits your life.';
const KEYWORDS = [
  'INSU',
  'compare insurance',
  'health insurance',
  'auto insurance',
  'home insurance',
  'travel insurance',
  'insurance agents',
];
const DEFAULT_IMAGE = '/img/insu-social-cover.jpg';
const DEFAULT_IMAGE_ALT = 'INSU — Cover what matters. Health, auto, home and travel insurance.';

const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

const getSiteUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  return value ? trimTrailingSlash(value) : '';
};

const toAbsoluteUrl = (path: string) => {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return path;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

const cleanPath = (asPath: string) => {
  const path = asPath.split('#')[0]?.split('?')[0] || '/';
  return path === '/' ? '' : path;
};

const SeoHead = () => {
  const router = useRouter();
  const title = DEFAULT_TITLE;
  const description = DEFAULT_DESCRIPTION;
  const siteUrl = getSiteUrl();
  const path = cleanPath(router.asPath);
  const canonicalUrl = siteUrl ? `${siteUrl}${path}` : undefined;
  const imageUrl = toAbsoluteUrl(DEFAULT_IMAGE);
  const locale = router.locale ?? router.defaultLocale ?? 'en';

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={KEYWORDS.join(', ')} />
      <meta name="robots" content="index,follow" />
      <meta name="author" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="theme-color" content="#4040f2" />
      <meta name="format-detection" content="telephone=no" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={DEFAULT_IMAGE_ALT} />
      <meta property="og:locale" content={locale} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={DEFAULT_IMAGE_ALT} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {siteUrl &&
        router.locales?.map((nextLocale) => (
          <link
            key={nextLocale}
            rel="alternate"
            hrefLang={nextLocale}
            href={`${siteUrl}/${nextLocale}${path || '/'}`}
          />
        ))}
      {siteUrl && <link rel="alternate" hrefLang="x-default" href={`${siteUrl}${path || '/'}`} />}
    </Head>
  );
};

export default SeoHead;
