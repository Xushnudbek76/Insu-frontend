import { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client/react';
import { GET_ALL_CLAIMS_BY_ADMIN } from '@/apollo/admin/query';
import ClaimList from '@/libs/components/admin/claims/ClaimList';
import withLayoutAdmin from '@/layout/LayoutAdmin';
import { getTotal } from '@/libs/utils/format';

const DEFAULT_LIMIT = 8;

const AdminClaims: NextPage = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [claimsTotal, setClaimsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');

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

  return (
    <ClaimList
      claims={claims}
      loading={loading && claims.length === 0}
      total={claimsTotal}
      page={page}
      limit={limit}
      activeStatus={status}
      searchText={searchText}
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
