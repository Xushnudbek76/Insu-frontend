import { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ALL_CLAIMS_BY_ADMIN } from '@/apollo/admin/query';
import { UPDATE_CLAIM_STATUS_BY_ADMIN } from '@/apollo/admin/mutation';
import ClaimList from '@/libs/components/admin/claims/ClaimList';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const DEFAULT_LIMIT = 8;
const getTotal = (metaCounter: any) => metaCounter?.total ?? metaCounter?.[0]?.total ?? 0;

const AdminClaims: NextPage = () => {
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});
  const [claims, setClaims] = useState<any[]>([]);
  const [claimsTotal, setClaimsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [updateClaimStatus] = useMutation(UPDATE_CLAIM_STATUS_BY_ADMIN);

  const inquiry = useMemo(() => ({
    page,
    limit,
    sort: 'createdAt',
    direction: 'DESC',
    search: {
      ...(status !== 'ALL' ? { claimStatus: status } : {}),
      ...(submittedText ? { text: submittedText } : {}),
    },
  }), [limit, page, status, submittedText]);

  const { data, loading, refetch } = useQuery(GET_ALL_CLAIMS_BY_ADMIN, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: { input: inquiry },
  });

  useEffect(() => {
    const result = data as any;
    setClaims(result?.getAllClaimsByAdmin?.list ?? []);
    setClaimsTotal(getTotal(result?.getAllClaimsByAdmin?.metaCounter));
  }, [data]);

  const openMenu = (key: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl({ [key]: event.currentTarget });
  };

  const closeMenu = () => setAnchorEl({});

  const syncClaims = () => {
    refetch({ input: inquiry }).catch((error) => console.warn('Admin claims refetch failed', error));
  };

  const updateStatus = async (_id: string, newStatus: string) => {
    closeMenu();
    setClaims((prev) => prev.map((claim) => (claim._id === _id ? { ...claim, claimStatus: newStatus } : claim)));
    try {
      const result = await updateClaimStatus({ variables: { input: { claimId: _id, newStatus } } });
      const updated = (result.data as any)?.updateClaimStatus;
      if (updated) setClaims((prev) => prev.map((claim) => (claim._id === _id ? { ...claim, ...updated } : claim)));
      syncClaims();
    } catch (error) {
      syncClaims();
      console.warn('Admin claim update failed', error);
    }
  };

  return (
    <ClaimList
      claims={claims}
      loading={loading && claims.length === 0}
      total={claimsTotal}
      page={page}
      limit={limit}
      activeStatus={status}
      searchText={searchText}
      anchorEl={anchorEl}
      onOpenMenu={openMenu}
      onCloseMenu={closeMenu}
      onUpdateClaim={updateStatus}
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

export default withLayoutAdmin(AdminClaims);
