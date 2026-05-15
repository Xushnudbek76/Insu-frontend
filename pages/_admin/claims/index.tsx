import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ALL_CLAIMS_BY_ADMIN } from '@/apollo/admin/query';
import { UPDATE_CLAIM_STATUS_BY_ADMIN } from '@/apollo/admin/mutation';
import AdminResourcePage, { AdminRow } from '@/libs/components/admin/AdminResourcePage';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const LIMIT = 8;
const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Settled', value: 'SETTLED' },
];

const money = (value?: number) => `$${Number(value ?? 0).toLocaleString()}`;
const shortDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : '-');

const AdminClaims: NextPage = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [status, setStatus] = useState('');
  const [updateClaimStatus] = useMutation(UPDATE_CLAIM_STATUS_BY_ADMIN);

  const variables = useMemo(() => ({
    input: {
      page,
      limit: LIMIT,
      sort: 'createdAt',
      direction: 'DESC',
      search: {
        ...(status ? { claimStatus: status } : {}),
        ...(submittedText ? { text: submittedText } : {}),
      },
    },
  }), [page, status, submittedText]);

  const { data, loading, refetch } = useQuery(GET_ALL_CLAIMS_BY_ADMIN, {
    variables,
    fetchPolicy: 'network-only',
  });

  const updateStatus = async (claimId: string, newStatus: string) => {
    await updateClaimStatus({ variables: { input: { claimId, newStatus } } });
    await refetch();
  };

  const result = data as any;
  const claims = result?.getAllClaimsByAdmin?.list ?? [];
  const total = result?.getAllClaimsByAdmin?.metaCounter?.total ?? 0;
  const rows: AdminRow[] = claims.map((claim: any) => ({
    id: claim._id,
    title: claim.claimTitle || 'Claim request',
    subtitle: claim.claimDesc || claim.policyId || claim._id,
    status: claim.claimStatus,
    cells: [
      { label: 'Amount', value: money(claim.claimAmount) },
      { label: 'Policy', value: claim.policyId },
      { label: 'Agent', value: claim.agentId || '-' },
      { label: 'Created', value: shortDate(claim.createdAt) },
    ],
    actions: [
      {
        label: 'Approve',
        disabled: claim.claimStatus === 'APPROVED',
        onClick: () => updateStatus(claim._id, 'APPROVED'),
      },
      {
        label: 'Reject',
        tone: 'ghost',
        disabled: claim.claimStatus === 'REJECTED',
        onClick: () => updateStatus(claim._id, 'REJECTED'),
      },
      {
        label: 'Settle',
        tone: 'ghost',
        disabled: claim.claimStatus === 'SETTLED',
        onClick: () => updateStatus(claim._id, 'SETTLED'),
      },
    ],
  }));

  return (
    <AdminResourcePage
      eyebrow='Claims'
      title='Claims'
      description='Review claim requests and move them through approval, rejection, or settlement.'
      rows={rows}
      loading={loading}
      total={total}
      page={page}
      limit={LIMIT}
      searchText={searchText}
      searchPlaceholder='Search claims'
      statusValue={status}
      statusOptions={STATUS_OPTIONS}
      emptyTitle='No claims found'
      emptyDescription='Try another claim status or search phrase.'
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

export default withLayoutAdmin(AdminClaims);
