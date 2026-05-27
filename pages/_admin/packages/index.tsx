import { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ALL_PACKAGES_BY_ADMIN } from '@/apollo/admin/query';
import { UPDATE_PACKAGE_BY_ADMIN } from '@/apollo/admin/mutation';
import PackageList from '@/libs/components/admin/packages/PackageList';
import withLayoutAdmin from '@/layout/LayoutAdmin';
import { getTotal } from '@/libs/utils/format';

const DEFAULT_LIMIT = 8;

const AdminPackages: NextPage = () => {
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});
  const [packages, setPackages] = useState<any[]>([]);
  const [packagesTotal, setPackagesTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [updatePackage] = useMutation(UPDATE_PACKAGE_BY_ADMIN);

  const inquiry = useMemo(() => ({
    page,
    limit,
    sort: 'createdAt',
    direction: 'DESC',
    search: {
      ...(status !== 'ALL' ? { packageStatus: status } : {}),
      ...(type !== 'ALL' ? { packageType: type } : {}),
    },
  }), [limit, page, status, type]);

  const { data, loading, refetch } = useQuery(GET_ALL_PACKAGES_BY_ADMIN, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: { input: inquiry },
  });

  useEffect(() => {
    const result = data as any;
    setPackages(result?.getAllPackagesByAdmin?.list ?? []);
    setPackagesTotal(getTotal(result?.getAllPackagesByAdmin?.metaCounter));
  }, [data]);

  const openMenu = (key: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl({ [key]: event.currentTarget });
  };

  const closeMenu = () => setAnchorEl({});

  const syncPackages = async () => {
    try {
      await refetch({ input: inquiry });
    } catch (error) {
      console.warn('Admin packages refetch failed', error);
    }
  };

  const updatePackageStatus = async (_id: string, packageStatus: string) => {
    closeMenu();
    try {
      const result = await updatePackage({ variables: { input: { _id, packageStatus } } });
      const updated = (result.data as any)?.updatePackageByAdmin;
      if (!updated?._id) throw new Error('Package status update returned no package payload');
      setPackages((prev) => prev.map((pkg) => (pkg._id === _id ? { ...pkg, ...updated } : pkg)));
      await syncPackages();
    } catch (error) {
      await syncPackages();
      console.warn('Admin package update failed', error);
    }
  };

  return (
    <PackageList
      packages={packages}
      loading={loading && packages.length === 0}
      total={packagesTotal}
      page={page}
      limit={limit}
      activeStatus={status}
      typeFilter={type}
      anchorEl={anchorEl}
      onOpenMenu={openMenu}
      onCloseMenu={closeMenu}
      onUpdatePackage={updatePackageStatus}
      onStatusTabChange={(value) => {
        setPage(1);
        setStatus(value);
      }}
      onTypeFilterChange={(value) => {
        setPage(1);
        setType(value);
      }}
      onPageChange={setPage}
      onLimitChange={(nextLimit) => {
        setPage(1);
        setLimit(nextLimit);
      }}
    />
  );
};

export default withLayoutAdmin(AdminPackages);
