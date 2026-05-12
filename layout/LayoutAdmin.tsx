import type { ReactElement, ReactNode } from 'react';

const LayoutAdmin = (page: ReactElement): ReactNode => {
  return (
    <div className="admin-wrap">
      <div className="admin-container">
        <h2 className="admin-title">Admin Dashboard</h2>
        {page}
      </div>
    </div>
  );
};

export default LayoutAdmin;
