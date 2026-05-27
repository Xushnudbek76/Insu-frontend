import { useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { Box, Stack } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AdminTablePanel, { AdminInlineMenu, AdminTableColumn, AdminTableRow } from '@/libs/components/admin/AdminTablePanel';
import { CREATE_NOTICE_BY_ADMIN, REMOVE_NOTICE_BY_ADMIN, UPDATE_NOTICE_BY_ADMIN } from '@/apollo/notice/mutation';
import { GET_ALL_NOTICES_BY_ADMIN } from '@/apollo/notice/query';
import withLayoutAdmin from '@/layout/LayoutAdmin';
import { getTotal } from '@/libs/utils/format';
import type { PagedResult } from '@/libs/types/common';
import type { Notice } from '@/libs/types/notice/notice';

const DEFAULT_LIMIT = 8;
const noticeCategories = ['EVENT', 'UPDATE', 'PROMOTION', 'SYSTEM'];
const noticeStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

const emptyForm = {
  _id: '',
  noticeCategory: 'EVENT',
  noticeStatus: 'ACTIVE',
  noticeTitle: '',
  noticeContent: '',
};

interface GetAllNoticesByAdminResponse {
  getAllNoticesByAdmin: PagedResult<Notice>;
}

const columns: AdminTableColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', align: 'center' },
  { key: 'date', label: 'Date', align: 'center' },
  { key: 'status', label: 'Status', align: 'center' },
  { key: 'action', label: 'Action', align: 'center' },
];

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '-');

const AdminNotices: NextPage = () => {
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});
  const [notices, setNotices] = useState<Notice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [form, setForm] = useState(emptyForm);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [createNotice] = useMutation(CREATE_NOTICE_BY_ADMIN);
  const [updateNotice] = useMutation(UPDATE_NOTICE_BY_ADMIN);
  const [removeNotice] = useMutation(REMOVE_NOTICE_BY_ADMIN);

  const inquiry = useMemo(() => ({
    page,
    limit,
    sort: 'createdAt',
    direction: 'DESC',
    search: {
      ...(status !== 'ALL' ? { noticeStatus: status } : {}),
      ...(category !== 'ALL' ? { noticeCategory: category } : {}),
      ...(submittedText.trim() ? { text: submittedText.trim() } : {}),
    },
  }), [category, limit, page, status, submittedText]);

  const { data, loading, refetch } = useQuery<GetAllNoticesByAdminResponse>(GET_ALL_NOTICES_BY_ADMIN, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: { input: inquiry },
  });

  useEffect(() => {
    setNotices(data?.getAllNoticesByAdmin?.list ?? []);
    setTotal(getTotal(data?.getAllNoticesByAdmin?.metaCounter));
  }, [data]);

  const syncNotices = () => {
    refetch({ input: inquiry }).catch((error) => console.warn('Admin notices refetch failed', error));
  };

  const openMenu = (key: string, event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl({ [key]: event.currentTarget });
  const closeMenu = () => setAnchorEl({});

  const resetForm = () => setForm(emptyForm);
  const focusEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      noticeCategory: form.noticeCategory,
      noticeTitle: form.noticeTitle.trim(),
      noticeContent: form.noticeContent.trim(),
    };
    if (!payload.noticeTitle || !payload.noticeContent) return;

    try {
      if (form._id) {
        await updateNotice({ variables: { input: { _id: form._id, ...payload, noticeStatus: form.noticeStatus } } });
      } else {
        await createNotice({ variables: { input: payload } });
      }
      resetForm();
      syncNotices();
    } catch (error) {
      console.warn('Admin notice save failed', error);
    }
  };

  const updateStatus = async (_id: string, noticeStatus: string) => {
    closeMenu();
    setNotices((prev) => prev.map((notice) => (notice._id === _id ? { ...notice, noticeStatus } : notice)));
    try {
      await updateNotice({ variables: { input: { _id, noticeStatus } } });
      syncNotices();
    } catch (error) {
      syncNotices();
      console.warn('Admin notice status update failed', error);
    }
  };

  const remove = async (_id: string, title: string) => {
    if (!window.confirm(`Remove ${title}?`)) return;
    try {
      await removeNotice({ variables: { noticeId: _id } });
      syncNotices();
    } catch (error) {
      syncNotices();
      console.warn('Admin notice remove failed', error);
    }
  };

  const rows: AdminTableRow[] = notices.map((notice) => ({
    id: notice._id,
    cells: {
      title: (
        <Stack className='admin-table-name admin-text-name'>
          <span>{notice.noticeTitle || 'Untitled notice'}</span>
          <small>{notice.noticeContent || '-'}</small>
        </Stack>
      ),
      category: notice.noticeCategory,
      date: formatDate(notice.createdAt),
      status: (
        <AdminInlineMenu
          anchorEl={anchorEl[`status-${notice._id}`] ?? null}
          label={notice.noticeStatus}
          options={noticeStatuses.filter((option) => option !== notice.noticeStatus)}
          tone={notice.noticeStatus === 'ACTIVE' ? 'success' : notice.noticeStatus === 'ARCHIVED' ? 'danger' : 'warning'}
          onClose={closeMenu}
          onOpen={(event) => openMenu(`status-${notice._id}`, event)}
          onSelect={(noticeStatus) => updateStatus(notice._id, noticeStatus)}
        />
      ),
      action: (
        <Stack className='admin-table-actions'>
          <button
            className='admin-icon-action'
            type='button'
            onClick={() => {
              setForm({ ...emptyForm, ...notice });
              focusEditor();
            }}
          >
            <EditOutlinedIcon />
          </button>
          <button className='admin-icon-action danger' type='button' onClick={() => remove(notice._id, notice.noticeTitle)}>
            <DeleteOutlineOutlinedIcon />
          </button>
        </Stack>
      ),
    },
  }));

  return (
    <Stack className='admin-table-page'>
      <Box ref={editorRef}>
        <Stack className='admin-editor-card' component='form' onSubmit={submit}>
          <Box>
            <span>Notice Editor</span>
            <h2>{form._id ? 'Edit notice' : 'Create notice'}</h2>
          </Box>
          <Stack className='admin-editor-grid'>
            <select value={form.noticeCategory} onChange={(event) => setForm((prev) => ({ ...prev, noticeCategory: event.target.value }))}>
              {noticeCategories.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            {form._id ? (
              <select value={form.noticeStatus} onChange={(event) => setForm((prev) => ({ ...prev, noticeStatus: event.target.value }))}>
                {noticeStatuses.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : null}
            <input
              placeholder='Notice title'
              value={form.noticeTitle}
              onChange={(event) => setForm((prev) => ({ ...prev, noticeTitle: event.target.value }))}
            />
            <textarea
              placeholder='Notice content'
              value={form.noticeContent}
              onChange={(event) => setForm((prev) => ({ ...prev, noticeContent: event.target.value }))}
            />
          </Stack>
          <Stack className='admin-editor-actions'>
            <button type='submit'>{form._id ? 'Save notice' : 'Create notice'}</button>
            {form._id ? <button type='button' onClick={resetForm}>Cancel</button> : null}
          </Stack>
        </Stack>
      </Box>

      <AdminTablePanel
        title='Notice List'
        description='Create and manage notices shown in the public CS center.'
        tabs={[
          { label: 'All', value: 'ALL' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
          { label: 'Archived', value: 'ARCHIVED' },
        ]}
        activeTab={status}
        searchText={searchText}
        searchPlaceholder='Search notices'
        filterValue={category}
        filterLabel='Notice category'
        filterOptions={[{ label: 'All', value: 'ALL' }, ...noticeCategories.map((value) => ({ label: value, value }))]}
        columns={columns}
        rows={rows}
        loading={loading && notices.length === 0}
        total={total}
        page={page}
        limit={limit}
        emptyText='data not found!'
        onTabChange={(value) => {
          setPage(1);
          setStatus(value);
        }}
        onSearchTextChange={setSearchText}
        onSearch={() => {
          setPage(1);
          setSubmittedText(searchText);
        }}
        onFilterChange={(value) => {
          setPage(1);
          setCategory(value);
        }}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setPage(1);
          setLimit(nextLimit);
        }}
      />
    </Stack>
  );
};

export default withLayoutAdmin(AdminNotices);
