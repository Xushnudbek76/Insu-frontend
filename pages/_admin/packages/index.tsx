import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ALL_PACKAGES_BY_ADMIN } from '@/apollo/admin/query';
import { REMOVE_PACKAGE_BY_ADMIN, UPDATE_PACKAGE_BY_ADMIN } from '@/apollo/admin/mutation';
import AdminResourcePage, { AdminRow } from '@/libs/components/admin/AdminResourcePage';
import { toAssetUrl } from '@/libs/api';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const LIMIT = 8;
const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
];
const TYPE_OPTIONS = [
  { label: 'All types', value: '' },
  { label: 'Auto', value: 'AUTO' },
  { label: 'Home', value: 'HOME' },
  { label: 'Health', value: 'HEALTH' },
  { label: 'Travel', value: 'TRAVEL' },
  { label: 'Pet', value: 'PET' },
  { label: 'Term Life', value: 'TERM_LIFE' },
];

const money = (value?: number) => `$${Number(value ?? 0).toLocaleString()}`;

const AdminPackages: NextPage = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [updatePackage] = useMutation(UPDATE_PACKAGE_BY_ADMIN);
  const [removePackage] = useMutation(REMOVE_PACKAGE_BY_ADMIN);

  const variables = useMemo(() => ({
    input: {
      page,
      limit: LIMIT,
      sort: 'createdAt',
      direction: 'DESC',
      search: {
        ...(status ? { packageStatus: status } : {}),
        ...(type ? { packageType: type } : {}),
        ...(submittedText ? { text: submittedText } : {}),
      },
    },
  }), [page, status, submittedText, type]);

  const { data, loading, refetch } = useQuery(GET_ALL_PACKAGES_BY_ADMIN, {
    variables,
    fetchPolicy: 'network-only',
  });

  const updatePackageStatus = async (_id: string, packageStatus: string) => {
    await updatePackage({ variables: { input: { _id, packageStatus } } });
    await refetch();
  };

  const archivePackage = async (_id: string, title: string) => {
    if (!window.confirm(`Remove ${title}?`)) return;
    await removePackage({ variables: { packageId: _id } });
    await refetch();
  };

  const result = data as any;
  const packages = result?.getAllPackagesByAdmin?.list ?? [];
  const total = result?.getAllPackagesByAdmin?.metaCounter?.total ?? 0;
  const rows: AdminRow[] = packages.map((pkg: any) => {
    const title = pkg.packageTitle || 'Untitled package';

    return {
      id: pkg._id,
      title,
      subtitle: pkg.packageDesc || pkg.memberId || pkg._id,
      status: pkg.packageStatus,
      image: toAssetUrl(pkg.packageImages?.[0]) ?? '/img/placeholder-article.svg',
      cells: [
        { label: 'Type', value: pkg.packageType },
        { label: 'Price', value: money(pkg.packagePrice) },
        { label: 'Views', value: pkg.packageViews ?? 0 },
        { label: 'Likes', value: pkg.packageLikes ?? 0 },
      ],
      actions: [
        {
          label: 'Active',
          disabled: pkg.packageStatus === 'ACTIVE',
          onClick: () => updatePackageStatus(pkg._id, 'ACTIVE'),
        },
        {
          label: 'Inactive',
          tone: 'ghost',
          disabled: pkg.packageStatus === 'INACTIVE',
          onClick: () => updatePackageStatus(pkg._id, 'INACTIVE'),
        },
        {
          label: 'Archive',
          tone: 'ghost',
          disabled: pkg.packageStatus === 'ARCHIVED',
          onClick: () => updatePackageStatus(pkg._id, 'ARCHIVED'),
        },
        {
          label: 'Remove',
          tone: 'danger',
          onClick: () => archivePackage(pkg._id, title),
        },
      ],
    };
  });

  return (
    <AdminResourcePage
      eyebrow='Inventory'
      title='Packages'
      description='Moderate insurance package visibility, lifecycle status, and archived listings.'
      rows={rows}
      loading={loading}
      total={total}
      page={page}
      limit={LIMIT}
      searchText={searchText}
      searchPlaceholder='Search packages'
      statusValue={status}
      statusOptions={STATUS_OPTIONS}
      typeValue={type}
      typeOptions={TYPE_OPTIONS}
      emptyTitle='No packages found'
      emptyDescription='Try a different package type, status, or search phrase.'
      onSearchTextChange={setSearchText}
      onSearch={() => {
        setPage(1);
        setSubmittedText(searchText.trim());
      }}
      onStatusChange={(value) => {
        setPage(1);
        setStatus(value);
      }}
      onTypeChange={(value) => {
        setPage(1);
        setType(value);
      }}
      onPageChange={setPage}
    />
  );
};

export default withLayoutAdmin(AdminPackages);
