import Link from 'next/link';
import { Box, Stack } from '@mui/material';
import AdminTablePanel, { AdminInlineMenu, AdminTableColumn, AdminTableRow } from '@/libs/components/admin/AdminTablePanel';
import { adminUserImage } from '@/libs/admin/image';

type MemberListProps = {
  members: any[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  activeStatus: string;
  searchText: string;
  typeFilter: string;
  anchorEl: Record<string, HTMLElement | null>;
  onOpenMenu: (key: string, event: React.MouseEvent<HTMLButtonElement>) => void;
  onCloseMenu: () => void;
  onUpdateMember: (_id: string, patch: Record<string, string>) => void;
  onStatusTabChange: (value: string) => void;
  onSearchTextChange: (value: string) => void;
  onSearch: () => void;
  onTypeFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const columns: AdminTableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'type', label: 'Member Type', align: 'center' },
  { key: 'rank', label: 'Rank', align: 'center' },
  { key: 'status', label: 'State', align: 'center' },
];

const statusOptions = ['ACTIVE', 'BLOCK', 'DELETE'];
const typeOptions = ['USER', 'AGENT', 'ADMIN'];

const MemberList = ({
  members,
  loading,
  total,
  page,
  limit,
  activeStatus,
  searchText,
  typeFilter,
  anchorEl,
  onOpenMenu,
  onCloseMenu,
  onUpdateMember,
  onStatusTabChange,
  onSearchTextChange,
  onSearch,
  onTypeFilterChange,
  onPageChange,
  onLimitChange,
}: MemberListProps) => {
  const rows: AdminTableRow[] = members.map((member) => {
    const name = member.memberNick || member.memberFullName || 'Unnamed member';
    const memberImage = adminUserImage(member.memberImage);

    return {
      id: member._id,
      cells: {
        name: (
          <Stack className='admin-table-name'>
            <Link href={`/agents/${member._id}`}>
              <Box component='img' src={memberImage} alt={name} />
            </Link>
            <Link href={`/agents/${member._id}`}>{name}</Link>
          </Stack>
        ),
        phone: member.memberPhone || '-',
        type: (
          <AdminInlineMenu
            anchorEl={anchorEl[`type-${member._id}`] ?? null}
            label={member.memberType}
            options={typeOptions.filter((type) => type !== member.memberType)}
            tone='success'
            onClose={onCloseMenu}
            onOpen={(event) => onOpenMenu(`type-${member._id}`, event)}
            onSelect={(memberType) => onUpdateMember(member._id, { memberType })}
          />
        ),
        rank: member.memberRank ?? 0,
        status: (
          <AdminInlineMenu
            anchorEl={anchorEl[`status-${member._id}`] ?? null}
            label={member.memberStatus}
            options={statusOptions.filter((status) => status !== member.memberStatus)}
            tone={member.memberStatus === 'ACTIVE' ? 'success' : 'danger'}
            onClose={onCloseMenu}
            onOpen={(event) => onOpenMenu(`status-${member._id}`, event)}
            onSelect={(memberStatus) => onUpdateMember(member._id, { memberStatus })}
          />
        ),
      },
    };
  });

  return (
    <AdminTablePanel
      title='Member List'
      description='Manage users, agents, and administrators with Nestar-style row controls.'
      tabs={[
        { label: 'All', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Blocked', value: 'BLOCK' },
        { label: 'Deleted', value: 'DELETE' },
      ]}
      activeTab={activeStatus}
      searchText={searchText}
      searchPlaceholder='Search user name'
      filterValue={typeFilter}
      filterLabel='Member type'
      filterOptions={[
        { label: 'All', value: 'ALL' },
        { label: 'User', value: 'USER' },
        { label: 'Agent', value: 'AGENT' },
        { label: 'Admin', value: 'ADMIN' },
      ]}
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
      onFilterChange={onTypeFilterChange}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
};

export default MemberList;
