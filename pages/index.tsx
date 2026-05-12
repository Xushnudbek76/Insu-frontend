import Head from 'next/head';
import type { NextPageWithLayout } from '@/libs/types/next';
import type { ReactElement } from 'react';
import NextLink from 'next/link';

import LayoutHome from '@/layout/LayoutHome';

const HomePage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>INSU Web</title>
      </Head>
      <section className="homepage-hero">
        <div className="hero-inner">
          <span className="hero-label">Insurance-AI Platform</span>
          <h1 className="hero-title">
            Find the right insurance coverage for you
          </h1>
          <p className="hero-desc">
            Smart marketplace powered by AI. Compare plans, connect with agents,
            and manage your policies in one place.
          </p>
          <div className="hero-actions">
            <NextLink href="/packages" className="hero-btn primary">
              Browse Packages
            </NextLink>
            <NextLink href="/account/join" className="hero-btn secondary">
              Login / Register
            </NextLink>
          </div>
        </div>
      </section>
    </>
  );
};

HomePage.getLayout = (page: ReactElement) => {
  return LayoutHome(page);
};

export default HomePage;
