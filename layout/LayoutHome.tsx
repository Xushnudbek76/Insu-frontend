import type { ComponentType, ReactElement, ReactNode } from 'react';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import Top from '@/libs/components/navigation/Top';
import Footer from '@/libs/components/footer/Footer';
import Chat from '@/libs/components/Chat';

const LayoutHomeInner = ({ page }: { page: ReactElement }) => {
  const device = useDeviceDetect();
  const wrapId = device === 'mobile' ? 'mobile-wrap' : 'pc-wrap';

  return (
    <div id={wrapId}>
      <div className="page-wrap">
        <Top />
        <main>{page}</main>
        {device !== 'mobile' && <Chat />}
        <Footer />
      </div>
    </div>
  );
};

const withLayoutMain = <P extends object>(Component: ComponentType<P>) => {
  const Wrapped = (props: P) => (
    <LayoutHomeInner page={<Component {...props} />} />
  );
  Wrapped.displayName = `withLayoutMain(${Component.displayName ?? Component.name})`;
  return Wrapped;
};

export default withLayoutMain;
