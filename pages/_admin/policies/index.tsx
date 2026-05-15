import { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { ADMIN_GET_ALL_POLICIES } from '@/apollo/admin/query';
import { CANCEL_POLICY_BY_ADMIN } from '@/apollo/admin/mutation';
import PolicyList from '@/libs/components/admin/policies/PolicyList';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const DEFAULT_LIMIT = 8;
const getTotal = (metaCounter: any) => metaCounter?.total ?? metaCounter?.[0]?.total ?? 0;

const AdminPolicies: NextPage = () => {
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});
  const [policies, setPolicies] = useState<any[]>([]);
  const [policiesTotal, setPoliciesTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [cancelPolicy] = useMutation(CANCEL_POLICY_BY_ADMIN);

  const inquiry = useMemo(() => ({
    page,
    limit,
    sort: 'createdAt',
    direction: 'DESC',
    search: {
      ...(status !== 'ALL' ? { policyStatus: status } : {}),
      ...(submittedText ? { text: submittedText } : {}),
    },
  }), [limit, page, status, submittedText]);

  const { data, loading, refetch } = useQuery(ADMIN_GET_ALL_POLICIES, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: { input: inquiry },
  });

  useEffect(() => {
    const result = data as any;
    setPolicies(result?.adminGetAllPolicies?.list ?? []);
    setPoliciesTotal(getTotal(result?.adminGetAllPolicies?.metaCounter));
  }, [data]);

  const openMenu = (key: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl({ [key]: event.currentTarget });
  };

  const closeMenu = () => setAnchorEl({});

  const syncPolicies = () => {
    refetch({ input: inquiry }).catch((error) => console.warn('Admin policies refetch failed', error));
  };

  const cancel = async (_id: string, packageName: string) => {
    closeMenu();
    if (!window.confirm(`Cancel policy for ${packageName}?`)) return;
    setPolicies((prev) => prev.map((policy) => (policy._id === _id ? { ...policy, policyStatus: 'CANCELLED' } : policy)));
    try {
      const result = await cancelPolicy({ variables: { policyId: _id } });
      const updated = (result.data as any)?.cancelPolicy;
      if (updated) setPolicies((prev) => prev.map((policy) => (policy._id === _id ? { ...policy, ...updated } : policy)));
      syncPolicies();
    } catch (error) {
      syncPolicies();
      console.warn('Admin policy cancel failed', error);
    }
  };

  return (
    <PolicyList
      policies={policies}
      loading={loading && policies.length === 0}
      total={policiesTotal}
      page={page}
      limit={limit}
      activeStatus={status}
      searchText={searchText}
      anchorEl={anchorEl}
      onOpenMenu={openMenu}
      onCloseMenu={closeMenu}
      onCancelPolicy={cancel}
      onStatusTabChange={(value) => {
        setPage(1);
        setStatus(value);
      }}
      onSearchTextChange={setSearchText}
      onSearch={() => {
        setPage(1);
        setSubmittedText(searchText.trim());
      }}
      onPageChange={setPage}
      onLimitChange={(nextLimit) => {
        setPage(1);
        setLimit(nextLimit);
      }}
    />
  );
};

export default withLayoutAdmin(AdminPolicies);
