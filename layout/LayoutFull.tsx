import type { ComponentType, ReactElement } from 'react';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import Top from '@/libs/components/navigation/Top';
import Footer from '@/libs/components/footer/Footer';

const LayoutFullInner = ({ page }: { page: ReactElement }) => {
  const device = useDeviceDetect();

  if (!device) return null;

  const wrapId = device === 'mobile' ? 'mobile-wrap' : 'pc-wrap';

  return (
    <div id={wrapId}>
      <div className="page-wrap">
        <Top />
        <main className="layout-full-main">{page}</main>
        <Footer />
      </div>
    </div>
  );
};

const withLayoutFull = <P extends object>(Component: ComponentType<P>) => {
  const Wrapped = (props: P) => (
    <LayoutFullInner page={<Component {...props} />} />
  );
  Wrapped.displayName = `withLayoutFull(${Component.displayName ?? Component.name})`;
  return Wrapped;
};

export default withLayoutFull;
