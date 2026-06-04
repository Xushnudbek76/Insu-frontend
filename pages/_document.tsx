import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    const locale = this.props.__NEXT_DATA__.locale ?? 'en';
    const lang = locale === 'kr' ? 'ko' : locale;

    return (
      <Html lang={lang}>
        <Head>
          <link rel="icon" href="/favicon.svg" />
          <link rel="preload" href="/fonts/GeistVF.woff" as="font" type="font/woff" crossOrigin="anonymous" />
          <link rel="preload" href="/fonts/GeistMonoVF.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
