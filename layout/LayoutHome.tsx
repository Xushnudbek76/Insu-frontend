import type { ReactElement, ReactNode } from 'react';

import Top from '@/libs/components/navigation/Top';
import Footer from '@/libs/components/footer/Footer';

const LayoutHome = (page: ReactElement): ReactNode => {
  return (
    <div className="page-wrap">
      <Top />
      <main>{page}</main>
      <Footer />
    </div>
  );
};

export default LayoutHome;
