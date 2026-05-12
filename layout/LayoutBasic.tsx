import type { ReactElement, ReactNode } from 'react';

import Top from '@/libs/components/navigation/Top';
import Footer from '@/libs/components/footer/Footer';

const LayoutBasic = (page: ReactElement): ReactNode => {
  return (
    <div className="page-wrap">
      <Top />
      <main className="layout-basic-main">{page}</main>
      <Footer />
    </div>
  );
};

export default LayoutBasic;
