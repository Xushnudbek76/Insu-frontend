import AdminTablePanel, { AdminInlineMenu, AdminTableColumn, AdminTableRow } from '@/libs/components/admin/AdminTablePanel';

type ClaimListProps = {
  claims: any[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  activeStatus: string;
  searchText: string;
  anchorEl: Record<string, HTMLElement | null>;
  onOpenMenu: (key: string, event: React.MouseEvent<HTMLButtonElement>) => void;
  onCloseMenu: () => void;
  onUpdateClaim: (_id: string, newStatus: string) => void;
  onStatusTabChange: (value: string) => void;
  onSearchTextChange: (value: string) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const columns: AdminTableColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'amount', label: 'Amount', align: 'center' },
  { key: 'description', label: 'Description', align: 'center' },
  { key: 'documents', label: 'Documents', align: 'center' },
  { key: 'status', label: 'Status', align: 'center' },
];

const statusOptions = ['APPROVED', 'REJECTED', 'SETTLED'];
const money = (value?: number) => `$${Number(value ?? 0).toLocaleString()}`;

const ClaimList = ({
  claims,
  loading,
  total,
  page,
  limit,
  activeStatus,
  searchText,
  anchorEl,
  onOpenMenu,
  onCloseMenu,
  onUpdateClaim,
  onStatusTabChange,
  onSearchTextChange,
  onSearch,
  onPageChange,
  onLimitChange,
}: ClaimListProps) => {
  const rows: AdminTableRow[] = claims.map((claim) => ({
    id: claim._id,
    cells: {
      title: claim.claimTitle || 'Claim request',
      amount: money(claim.claimAmount),
      description: claim.claimDesc || '-',
      documents: claim.claimDocuments?.length ?? 0,
      status: (
        <AdminInlineMenu
          anchorEl={anchorEl[`status-${claim._id}`] ?? null}
          label={claim.claimStatus}
          options={statusOptions.filter((status) => status !== claim.claimStatus)}
          tone={claim.claimStatus === 'PENDING' ? 'warning' : claim.claimStatus === 'REJECTED' ? 'danger' : 'success'}
          onClose={onCloseMenu}
          onOpen={(event) => onOpenMenu(`status-${claim._id}`, event)}
          onSelect={(newStatus) => onUpdateClaim(claim._id, newStatus)}
        />
      ),
    },
  }));

  return (
    <AdminTablePanel
      title='Claim List'
      description='Review claim requests and move them through the settlement workflow.'
      tabs={[
        { label: 'All', value: 'ALL' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Settled', value: 'SETTLED' },
      ]}
      activeTab={activeStatus}
      searchText={searchText}
      searchPlaceholder='Search claims'
      columns={columns}
      rows={rows}
      loading={loading}
      total={total}
      page={page}
      limit={limit}
      emptyText='data not found!'
      onTabChange={onStatusTabChange}
      onSearchTextChange={onSearchTextChange}
      onSearch={onSearch}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
};

export default ClaimList;
