import Head from 'next/head';
import { useRouter } from 'next/router';

const SITE_NAME = 'INSU Web';
const DEFAULT_TITLE = 'INSU Web | Insurance Platform Portfolio';
const DEFAULT_DESCRIPTION =
  'INSU Web is a full-stack insurance platform frontend for browsing plans, comparing coverage, managing policies, submitting claims, and joining a customer community.';
const KEYWORDS = [
  'INSU Web',
  'insurance platform',
  'insurance marketplace',
  'Next.js portfolio',
  'GraphQL insurance app',
  'Apollo Client',
  'full-stack portfolio',
];
const DEFAULT_IMAGE = '/img/hero-img/health.webp';

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
      <meta name="author" content="INSU Web" />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="theme-color" content="#4040f2" />
      <meta name="format-detection" content="telephone=no" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content={locale} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
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
