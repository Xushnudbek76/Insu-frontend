import { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

export type AdminFilterOption = {
  label: string;
  value: string;
};

export type AdminRowAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'danger' | 'ghost';
};

export type AdminRowCell = {
  label: string;
  value?: ReactNode;
};

export type AdminRow = {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  image?: string;
  cells: AdminRowCell[];
  actions?: AdminRowAction[];
};

type AdminResourcePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  rows: AdminRow[];
  loading?: boolean;
  total: number;
  page: number;
  limit: number;
  searchText: string;
  searchPlaceholder?: string;
  statusValue?: string;
  statusOptions?: AdminFilterOption[];
  typeValue?: string;
  typeOptions?: AdminFilterOption[];
  emptyTitle: string;
  emptyDescription: string;
  onSearchTextChange: (value: string) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onStatusChange?: (value: string) => void;
  onTypeChange?: (value: string) => void;
};

const getActionClass = (tone?: AdminRowAction['tone']) => {
  if (tone === 'danger') return 'admin-row-action danger';
  if (tone === 'ghost') return 'admin-row-action ghost';
  return 'admin-row-action primary';
};

const AdminResourcePage = ({
  eyebrow,
  title,
  description,
  rows,
  loading = false,
  total,
  page,
  limit,
  searchText,
  searchPlaceholder = 'Search',
  statusValue = '',
  statusOptions,
  typeValue = '',
  typeOptions,
  emptyTitle,
  emptyDescription,
  onSearchTextChange,
  onSearch,
  onPageChange,
  onStatusChange,
  onTypeChange,
}: AdminResourcePageProps) => {
  const pages = Math.max(1, Math.ceil(total / limit));
  const showingFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

  return (
    <Stack className='admin-resource-page'>
      <Stack className='admin-resource-hero'>
        <Box className='admin-eyebrow'>{eyebrow}</Box>
        <Stack className='admin-resource-heading'>
          <Box>
            <h1>{title}</h1>
            <p>{description}</p>
          </Box>
          <Box className='admin-total-pill'>{total} total</Box>
        </Stack>
      </Stack>

      <Stack className='admin-toolbar'>
        <Stack className='admin-search-box'>
          <SearchOutlinedIcon />
          <input
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSearch();
            }}
          />
          <button type='button' onClick={onSearch}>
            Search
          </button>
        </Stack>

        <Stack className='admin-filter-row'>
          {statusOptions ? (
            <select
              aria-label='Status filter'
              value={statusValue}
              onChange={(event) => onStatusChange?.(event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}
          {typeOptions ? (
            <select
              aria-label='Type filter'
              value={typeValue}
              onChange={(event) => onTypeChange?.(event.target.value)}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}
        </Stack>
      </Stack>

      <Stack className='admin-list-card'>
        <Stack className='admin-list-meta'>
          <span>
            Showing {showingFrom}-{showingTo}
          </span>
          <span>
            Page {page} of {pages}
          </span>
        </Stack>

        {loading ? (
          <Stack className='admin-skeleton-list'>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box className='admin-skeleton-row' key={`admin-skeleton-${index}`} />
            ))}
          </Stack>
        ) : rows.length ? (
          <Stack className='admin-rows'>
            {rows.map((row) => (
              <Stack className='admin-row' key={row.id}>
                <Stack className='admin-row-main'>
                  {row.image ? <Box component='img' className='admin-row-image' src={row.image} alt={row.title} /> : null}
                  <Box className='admin-row-copy'>
                    <h3>{row.title}</h3>
                    {row.subtitle ? <p>{row.subtitle}</p> : null}
                  </Box>
                  {row.status ? <Box className={`admin-status-chip ${row.status.toLowerCase()}`}>{row.status}</Box> : null}
                </Stack>

                <Stack className='admin-row-cells'>
                  {row.cells.map((cell) => (
                    <Box className='admin-row-cell' key={`${row.id}-${cell.label}`}>
                      <span>{cell.label}</span>
                      <strong>{cell.value ?? '-'}</strong>
                    </Box>
                  ))}
                </Stack>

                {row.actions?.length ? (
                  <Stack className='admin-row-actions'>
                    {row.actions.map((action) => (
                      <button
                        className={getActionClass(action.tone)}
                        disabled={action.disabled}
                        key={`${row.id}-${action.label}`}
                        type='button'
                        onClick={action.onClick}
                      >
                        {action.label}
                      </button>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            ))}
          </Stack>
        ) : (
          <Stack className='admin-empty-state'>
            <InboxOutlinedIcon />
            <h3>{emptyTitle}</h3>
            <p>{emptyDescription}</p>
          </Stack>
        )}

        <Stack className='admin-pagination'>
          <button disabled={page <= 1} type='button' onClick={() => onPageChange(page - 1)}>
            <ChevronLeftOutlinedIcon />
          </button>
          <span>{page}</span>
          <button disabled={page >= pages} type='button' onClick={() => onPageChange(page + 1)}>
            <ChevronRightOutlinedIcon />
          </button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AdminResourcePage;
