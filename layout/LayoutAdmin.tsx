import type { ComponentType, ReactElement } from 'react';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';

const LayoutAdminInner = ({ page }: { page: ReactElement }) => {
  const device = useDeviceDetect();
  const wrapId = device === 'mobile' ? 'mobile-wrap' : 'pc-wrap';

  return (
    <div id={wrapId}>
      <div className="admin-wrap">
        <div className="admin-container">
          <h2 className="admin-title">Admin Dashboard</h2>
          {page}
        </div>
      </div>
    </div>
  );
};

const withLayoutAdmin = <P extends object>(Component: ComponentType<P>) => {
  const Wrapped = (props: P) => (
    <LayoutAdminInner page={<Component {...props} />} />
  );
  Wrapped.displayName = `withLayoutAdmin(${Component.displayName ?? Component.name})`;
  return Wrapped;
};

export default withLayoutAdmin;
