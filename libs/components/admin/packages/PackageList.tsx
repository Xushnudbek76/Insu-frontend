import Link from 'next/link';
import { Box, Stack } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AdminTablePanel, { AdminInlineMenu, AdminTableColumn, AdminTableRow } from '@/libs/components/admin/AdminTablePanel';
import { toAssetUrl } from '@/libs/api';

type PackageListProps = {
  packages: any[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  activeStatus: string;
  typeFilter: string;
  anchorEl: Record<string, HTMLElement | null>;
  onOpenMenu: (key: string, event: React.MouseEvent<HTMLButtonElement>) => void;
  onCloseMenu: () => void;
  onUpdatePackage: (_id: string, packageStatus: string) => void;
  onRemovePackage: (_id: string, title: string) => void;
  onStatusTabChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const columns: AdminTableColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'price', label: 'Price', align: 'center' },
  { key: 'coverage', label: 'Coverage', align: 'center' },
  { key: 'type', label: 'Type', align: 'center' },
  { key: 'status', label: 'Status', align: 'center' },
];

const statusOptions = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
const money = (value?: number) => `$${Number(value ?? 0).toLocaleString()}`;

const PackageList = ({
  packages,
  loading,
  total,
  page,
  limit,
  activeStatus,
  typeFilter,
  anchorEl,
  onOpenMenu,
  onCloseMenu,
  onUpdatePackage,
  onRemovePackage,
  onStatusTabChange,
  onTypeFilterChange,
  onPageChange,
  onLimitChange,
}: PackageListProps) => {
  const rows: AdminTableRow[] = packages.map((pkg) => {
    const title = pkg.packageTitle || 'Untitled package';
    const image = toAssetUrl(pkg.packageImages?.[0]) ?? '/img/placeholder-article.svg';

    return {
      id: pkg._id,
      cells: {
        title: (
          <Stack className='admin-table-name'>
            <Link href={`/packages/${pkg._id}`}>
              <Box component='img' src={image} alt={title} />
            </Link>
            <Link href={`/packages/${pkg._id}`}>{title}</Link>
          </Stack>
        ),
        price: money(pkg.packagePrice),
        coverage: money(pkg.packageCoverageLimit),
        type: pkg.packageType,
        status: pkg.packageStatus === 'ARCHIVED' ? (
          <button className='admin-icon-action danger' type='button' onClick={() => onRemovePackage(pkg._id, title)}>
            <DeleteOutlineOutlinedIcon />
          </button>
        ) : (
          <AdminInlineMenu
            anchorEl={anchorEl[`status-${pkg._id}`] ?? null}
            label={pkg.packageStatus}
            options={statusOptions.filter((status) => status !== pkg.packageStatus)}
            tone={pkg.packageStatus === 'ACTIVE' ? 'success' : 'warning'}
            onClose={onCloseMenu}
            onOpen={(event) => onOpenMenu(`status-${pkg._id}`, event)}
            onSelect={(packageStatus) => onUpdatePackage(pkg._id, packageStatus)}
          />
        ),
      },
    };
  });

  return (
    <AdminTablePanel
      title='Package List'
      description='Moderate insurance packages with status controls similar to Nestar properties.'
      tabs={[
        { label: 'All', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Archived', value: 'ARCHIVED' },
      ]}
      activeTab={activeStatus}
      filterValue={typeFilter}
      filterLabel='Package type'
      filterOptions={[
        { label: 'All', value: 'ALL' },
        { label: 'Auto', value: 'AUTO' },
        { label: 'Home', value: 'HOME' },
        { label: 'Health', value: 'HEALTH' },
        { label: 'Travel', value: 'TRAVEL' },
        { label: 'Pet', value: 'PET' },
        { label: 'Term Life', value: 'TERM_LIFE' },
      ]}
      columns={columns}
      rows={rows}
      loading={loading}
      total={total}
      page={page}
      limit={limit}
      emptyText='data not found!'
      onTabChange={onStatusTabChange}
      onFilterChange={onTypeFilterChange}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
};

export default PackageList;
