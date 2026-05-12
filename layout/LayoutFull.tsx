import type { ReactElement, ReactNode } from 'react';

import Top from '@/libs/components/navigation/Top';
import Footer from '@/libs/components/footer/Footer';

const LayoutFull = (page: ReactElement): ReactNode => {
  return (
    <div className="page-wrap">
      <Top />
      <main className="layout-full-main">{page}</main>
      <Footer />
    </div>
  );
};

export default LayoutFull;
