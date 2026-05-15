import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { ADMIN_GET_ALL_POLICIES } from '@/apollo/admin/query';
import { CANCEL_POLICY_BY_ADMIN } from '@/apollo/admin/mutation';
import AdminResourcePage, { AdminRow } from '@/libs/components/admin/AdminResourcePage';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const LIMIT = 8;
const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Inactive', value: 'INACTIVE' },
];

const money = (value?: number) => `$${Number(value ?? 0).toLocaleString()}`;
const shortDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : '-');

const AdminPolicies: NextPage = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [status, setStatus] = useState('');
  const [cancelPolicy] = useMutation(CANCEL_POLICY_BY_ADMIN);

  const variables = useMemo(() => ({
    input: {
      page,
      limit: LIMIT,
      sort: 'createdAt',
      direction: 'DESC',
      search: {
        ...(status ? { policyStatus: status } : {}),
        ...(submittedText ? { text: submittedText } : {}),
      },
    },
  }), [page, status, submittedText]);

  const { data, loading, refetch } = useQuery(ADMIN_GET_ALL_POLICIES, {
    variables,
    fetchPolicy: 'network-only',
  });

  const cancel = async (policyId: string, packageName: string) => {
    if (!window.confirm(`Cancel policy for ${packageName}?`)) return;
    await cancelPolicy({ variables: { policyId } });
    await refetch();
  };

  const result = data as any;
  const policies = result?.adminGetAllPolicies?.list ?? [];
  const total = result?.adminGetAllPolicies?.metaCounter?.total ?? 0;
  const rows: AdminRow[] = policies.map((policy: any) => ({
    id: policy._id,
    title: policy.packageName || 'Policy',
    subtitle: policy.memberNick || policy.memberId || policy._id,
    status: policy.policyStatus,
    cells: [
      { label: 'Premium', value: money(policy.premiumAmount) },
      { label: 'Start', value: shortDate(policy.startDate) },
      { label: 'End', value: shortDate(policy.endDate) },
      { label: 'Agent', value: policy.AgentId || '-' },
    ],
    actions: [
      {
        label: 'Cancel',
        tone: 'danger',
        disabled: policy.policyStatus !== 'ACTIVE',
        onClick: () => cancel(policy._id, policy.packageName || 'this policy'),
      },
    ],
  }));

  return (
    <AdminResourcePage
      eyebrow='Coverage'
      title='Policies'
      description='Track issued policies and cancel active coverage when support needs intervention.'
      rows={rows}
      loading={loading}
      total={total}
      page={page}
      limit={LIMIT}
      searchText={searchText}
      searchPlaceholder='Search policies'
      statusValue={status}
      statusOptions={STATUS_OPTIONS}
      emptyTitle='No policies found'
      emptyDescription='Try another status or search phrase.'
      onSearchTextChange={setSearchText}
      onSearch={() => {
        setPage(1);
        setSubmittedText(searchText.trim());
      }}
      onStatusChange={(value) => {
        setPage(1);
        setStatus(value);
      }}
      onPageChange={setPage}
    />
  );
};

export default withLayoutAdmin(AdminPolicies);
