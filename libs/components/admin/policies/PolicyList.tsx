import AdminTablePanel, { AdminInlineMenu, AdminTableColumn, AdminTableRow } from '@/libs/components/admin/AdminTablePanel';

type PolicyListProps = {
  policies: any[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  activeStatus: string;
  searchText: string;
  anchorEl: Record<string, HTMLElement | null>;
  onOpenMenu: (key: string, event: React.MouseEvent<HTMLButtonElement>) => void;
  onCloseMenu: () => void;
  onCancelPolicy: (_id: string, packageName: string) => void;
  onStatusTabChange: (value: string) => void;
  onSearchTextChange: (value: string) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const columns: AdminTableColumn[] = [
  { key: 'package', label: 'Package' },
  { key: 'member', label: 'Member', align: 'center' },
  { key: 'premium', label: 'Premium', align: 'center' },
  { key: 'dates', label: 'Dates', align: 'center' },
  { key: 'status', label: 'Status', align: 'center' },
];

const money = (value?: number) => `$${Number(value ?? 0).toLocaleString()}`;
const shortDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : '-');

const PolicyList = ({
  policies,
  loading,
  total,
  page,
  limit,
  activeStatus,
  searchText,
  anchorEl,
  onOpenMenu,
  onCloseMenu,
  onCancelPolicy,
  onStatusTabChange,
  onSearchTextChange,
  onSearch,
  onPageChange,
  onLimitChange,
}: PolicyListProps) => {
  const rows: AdminTableRow[] = policies.map((policy) => ({
    id: policy._id,
    cells: {
      package: policy.packageName || 'Policy',
      member: policy.memberNick || '-',
      premium: money(policy.premiumAmount),
      dates: `${shortDate(policy.startDate)} - ${shortDate(policy.endDate)}`,
      status: (
        <AdminInlineMenu
          anchorEl={anchorEl[`status-${policy._id}`] ?? null}
          disabled={policy.policyStatus !== 'ACTIVE'}
          label={policy.policyStatus}
          options={['CANCELLED']}
          tone={policy.policyStatus === 'ACTIVE' ? 'success' : 'danger'}
          onClose={onCloseMenu}
          onOpen={(event) => onOpenMenu(`status-${policy._id}`, event)}
          onSelect={() => onCancelPolicy(policy._id, policy.packageName || 'this policy')}
        />
      ),
    },
  }));

  return (
    <AdminTablePanel
      title='Policy List'
      description='Review issued policies and cancel active coverage when needed.'
      tabs={[
        { label: 'All', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Cancelled', value: 'CANCELLED' },
        { label: 'Expired', value: 'EXPIRED' },
        { label: 'Inactive', value: 'INACTIVE' },
      ]}
      activeTab={activeStatus}
      searchText={searchText}
      searchPlaceholder='Search policies'
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

export default PolicyList;
