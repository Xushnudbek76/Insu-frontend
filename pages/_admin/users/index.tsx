import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ALL_MEMBERS_BY_ADMIN } from '@/apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '@/apollo/admin/mutation';
import AdminResourcePage, { AdminRow } from '@/libs/components/admin/AdminResourcePage';
import { toAssetUrl } from '@/libs/api';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const LIMIT = 8;
const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Blocked', value: 'BLOCK' },
  { label: 'Deleted', value: 'DELETE' },
];
const TYPE_OPTIONS = [
  { label: 'All roles', value: '' },
  { label: 'Users', value: 'USER' },
  { label: 'Agents', value: 'AGENT' },
  { label: 'Admins', value: 'ADMIN' },
];

const AdminUsers: NextPage = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [updateMember] = useMutation(UPDATE_MEMBER_BY_ADMIN);

  const variables = useMemo(() => ({
    input: {
      page,
      limit: LIMIT,
      sort: 'createdAt',
      direction: 'DESC',
      search: {
        ...(status ? { memberStatus: status } : {}),
        ...(type ? { memberType: type } : {}),
        ...(submittedText ? { text: submittedText } : {}),
      },
    },
  }), [page, status, submittedText, type]);

  const { data, loading, refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
    variables,
    fetchPolicy: 'network-only',
  });

  const updateMemberField = async (_id: string, patch: Record<string, string>) => {
    await updateMember({ variables: { input: { _id, ...patch } } });
    await refetch();
  };

  const result = data as any;
  const members = result?.getAllMembersByAdmin?.list ?? [];
  const total = result?.getAllMembersByAdmin?.metaCounter?.total ?? 0;
  const rows: AdminRow[] = members.map((member: any) => {
    const name = member.memberNick || member.memberFullName || 'Unnamed member';

    return {
      id: member._id,
      title: name,
      subtitle: member.memberPhone || member.memberAddress || member._id,
      status: member.memberStatus,
      image: toAssetUrl(member.memberImage) ?? '/img/profile/defaultUser.svg',
      cells: [
        { label: 'Role', value: member.memberType },
        { label: 'Rank', value: member.memberRank ?? 0 },
        { label: 'Likes', value: member.memberLikes ?? 0 },
        { label: 'Views', value: member.memberViews ?? 0 },
      ],
      actions: [
        {
          label: 'Activate',
          disabled: member.memberStatus === 'ACTIVE',
          onClick: () => updateMemberField(member._id, { memberStatus: 'ACTIVE' }),
        },
        {
          label: 'Block',
          tone: 'ghost',
          disabled: member.memberStatus === 'BLOCK',
          onClick: () => updateMemberField(member._id, { memberStatus: 'BLOCK' }),
        },
        {
          label: member.memberType === 'AGENT' ? 'Make User' : 'Make Agent',
          tone: 'ghost',
          onClick: () => updateMemberField(member._id, { memberType: member.memberType === 'AGENT' ? 'USER' : 'AGENT' }),
        },
        {
          label: 'Delete',
          tone: 'danger',
          disabled: member.memberStatus === 'DELETE',
          onClick: () => {
            if (window.confirm(`Delete ${name}?`)) updateMemberField(member._id, { memberStatus: 'DELETE' });
          },
        },
      ],
    };
  });

  return (
    <AdminResourcePage
      eyebrow='Members'
      title='Users'
      description='Review members, agents, and administrators from one operational list.'
      rows={rows}
      loading={loading}
      total={total}
      page={page}
      limit={LIMIT}
      searchText={searchText}
      searchPlaceholder='Search by nickname, phone, or name'
      statusValue={status}
      statusOptions={STATUS_OPTIONS}
      typeValue={type}
      typeOptions={TYPE_OPTIONS}
      emptyTitle='No members found'
      emptyDescription='Try another status, role, or search phrase.'
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

export default withLayoutAdmin(AdminUsers);
