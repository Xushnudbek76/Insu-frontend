import { ReactNode } from 'react';
import { Box, Menu, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

export type AdminTabOption = {
  label: string;
  value: string;
};

export type AdminFilterOption = {
  label: string;
  value: string;
};

export type AdminTableColumn = {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
};

export type AdminTableRow = {
  id: string;
  cells: Record<string, ReactNode>;
};

type AdminTablePanelProps = {
  title: string;
  description: string;
  tabs?: AdminTabOption[];
  activeTab?: string;
  searchText?: string;
  searchPlaceholder?: string;
  filterValue?: string;
  filterLabel?: string;
  filterOptions?: AdminFilterOption[];
  columns: AdminTableColumn[];
  rows: AdminTableRow[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  emptyText: string;
  onTabChange?: (value: string) => void;
  onSearchTextChange?: (value: string) => void;
  onSearch?: () => void;
  onFilterChange?: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

type AdminInlineMenuProps = {
  label: ReactNode;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
  anchorEl: HTMLElement | null;
  options: string[];
  disabled?: boolean;
  onOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export const AdminInlineMenu = ({
  label,
  tone = 'neutral',
  anchorEl,
  options,
  disabled = false,
  onOpen,
  onClose,
  onSelect,
}: AdminInlineMenuProps) => (
  <>
    <button className={`admin-inline-menu ${tone}`} disabled={disabled} type='button' onClick={onOpen}>
      <span>{label}</span>
      {!disabled ? <KeyboardArrowDownOutlinedIcon /> : null}
    </button>
    <Menu className='admin-row-menu' anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      {options.map((option) => (
        <MenuItem
          className='admin-row-menu-item'
          key={option}
          onClick={() => {
            onClose();
            onSelect(option);
          }}
        >
          {option}
        </MenuItem>
      ))}
    </Menu>
  </>
);

const AdminTablePanel = ({
  title,
  description,
  tabs,
  activeTab = 'ALL',
  searchText = '',
  searchPlaceholder = 'Search',
  filterValue = 'ALL',
  filterLabel = 'Filter',
  filterOptions,
  columns,
  rows,
  loading,
  total,
  page,
  limit,
  emptyText,
  onTabChange,
  onSearchTextChange,
  onSearch,
  onFilterChange,
  onPageChange,
  onLimitChange,
}: AdminTablePanelProps) => {
  const hasSearch = typeof onSearchTextChange === 'function' && typeof onSearch === 'function';

  return (
    <Stack className='admin-table-page'>
      <Stack className='admin-table-heading'>
        <Box>
          <span>Admin</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </Box>
        <Box className='admin-total-pill'>{total} total</Box>
      </Stack>

      <Stack className='admin-table-card'>
        {tabs?.length ? (
          <Stack className='admin-tab-menu'>
            {tabs.map((tab) => (
              <button
                className={activeTab === tab.value ? 'active' : ''}
                key={tab.value}
                type='button'
                onClick={() => onTabChange?.(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </Stack>
        ) : null}

        {(hasSearch || filterOptions?.length) ? (
          <Stack className='admin-table-toolbar'>
            {hasSearch ? (
              <Stack className='admin-table-search'>
                <SearchOutlinedIcon />
                <input
                  aria-label={searchPlaceholder}
                  placeholder={searchPlaceholder}
                  value={searchText}
                  onChange={(event) => onSearchTextChange?.(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onSearch?.();
                  }}
                />
                <button type='button' onClick={onSearch}>
                  Search
                </button>
              </Stack>
            ) : null}

            {filterOptions?.length ? (
              <select aria-label={filterLabel} value={filterValue} onChange={(event) => onFilterChange?.(event.target.value)}>
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
          </Stack>
        ) : null}

        <TableContainer className='admin-table-container'>
          <Table className='admin-data-table'>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell align={column.align ?? 'left'} key={column.key}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow className='admin-table-skeleton' key={`admin-loading-${index}`}>
                    <TableCell colSpan={columns.length}>
                      <Box />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((column) => (
                      <TableCell align={column.align ?? 'left'} key={`${row.id}-${column.key}`}>
                        {row.cells[column.key] ?? '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align='center' colSpan={columns.length}>
                    <Box className='admin-table-empty'>{emptyText}</Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          className='admin-table-pagination'
          component='section'
          count={total}
          page={page - 1}
          rowsPerPage={limit}
          rowsPerPageOptions={[8, 16, 32, 64]}
          onPageChange={(_, nextPage) => onPageChange(nextPage + 1)}
          onRowsPerPageChange={(event) => onLimitChange(Number(event.target.value))}
        />
      </Stack>
    </Stack>
  );
};

export default AdminTablePanel;
