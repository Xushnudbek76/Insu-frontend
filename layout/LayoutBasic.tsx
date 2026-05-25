import type { ComponentType, ReactElement } from 'react';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import Top from '@/libs/components/navigation/Top';
import Footer from '@/libs/components/footer/Footer';

const LayoutBasicInner = ({ page }: { page: ReactElement }) => {
  const device = useDeviceDetect();

  if (!device) return null;

  const wrapId = device === 'mobile' ? 'mobile-wrap' : 'pc-wrap';

  return (
    <div id={wrapId}>
      <div className="page-wrap">
        <Top />
        <main className="layout-basic-main">{page}</main>
        <Footer />
      </div>
    </div>
  );
};

const withLayoutBasic = <P extends object>(Component: ComponentType<P>) => {
  const Wrapped = (props: P) => (
    <LayoutBasicInner page={<Component {...props} />} />
  );
  Wrapped.displayName = `withLayoutBasic(${Component.displayName ?? Component.name})`;
  return Wrapped;
};

export default withLayoutBasic;
