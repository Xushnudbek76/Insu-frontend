import { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ALL_MEMBERS_BY_ADMIN } from '@/apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '@/apollo/admin/mutation';
import MemberList from '@/libs/components/admin/users/MemberList';
import withLayoutAdmin from '@/layout/LayoutAdmin';
import { getTotal } from '@/libs/utils/format';

const DEFAULT_LIMIT = 8;

const AdminUsers: NextPage = () => {
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});
  const [members, setMembers] = useState<any[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [updateMember] = useMutation(UPDATE_MEMBER_BY_ADMIN);

  const inquiry = useMemo(() => ({
    page,
    limit,
    sort: 'createdAt',
    direction: 'DESC',
    search: {
      ...(status !== 'ALL' ? { memberStatus: status } : {}),
      ...(type !== 'ALL' ? { memberType: type } : {}),
      ...(submittedText ? { text: submittedText } : {}),
    },
  }), [limit, page, status, submittedText, type]);

  const { data, loading, refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: { input: inquiry },
  });

  useEffect(() => {
    const result = data as any;
    setMembers(result?.getAllMembersByAdmin?.list ?? []);
    setMembersTotal(getTotal(result?.getAllMembersByAdmin?.metaCounter));
  }, [data]);

  const openMenu = (key: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl({ [key]: event.currentTarget });
  };

  const closeMenu = () => setAnchorEl({});

  const syncMembers = () => {
    refetch({ input: inquiry }).catch((error) => console.warn('Admin members refetch failed', error));
  };

  const updateMemberField = async (_id: string, patch: Record<string, string>) => {
    closeMenu();
    setMembers((prev) => prev.map((member) => (member._id === _id ? { ...member, ...patch } : member)));
    try {
      const result = await updateMember({ variables: { input: { _id, ...patch } } });
      const updated = (result.data as any)?.updateMemberByAdmin;
      if (updated) {
        setMembers((prev) => prev.map((member) => (member._id === _id ? { ...member, ...updated } : member)));
      }
      syncMembers();
    } catch (error) {
      syncMembers();
      console.warn('Admin member update failed', error);
    }
  };

  return (
    <MemberList
      members={members}
      loading={loading && members.length === 0}
      total={membersTotal}
      page={page}
      limit={limit}
      activeStatus={status}
      searchText={searchText}
      typeFilter={type}
      anchorEl={anchorEl}
      onOpenMenu={openMenu}
      onCloseMenu={closeMenu}
      onUpdateMember={updateMemberField}
      onStatusTabChange={(value) => {
        setPage(1);
        setStatus(value);
      }}
      onSearchTextChange={setSearchText}
      onSearch={() => {
        setPage(1);
        setSubmittedText(searchText.trim());
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

export default withLayoutAdmin(AdminUsers);
