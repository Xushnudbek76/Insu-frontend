import { useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { Box, Stack } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AdminTablePanel, { AdminInlineMenu, AdminTableColumn, AdminTableRow } from '@/libs/components/admin/AdminTablePanel';
import { CREATE_FAQ_BY_ADMIN, REMOVE_FAQ_BY_ADMIN, UPDATE_FAQ_BY_ADMIN } from '@/apollo/faq/mutation';
import { GET_ALL_FAQS_BY_ADMIN } from '@/apollo/faq/query';
import withLayoutAdmin from '@/layout/LayoutAdmin';
import { getTotal } from '@/libs/utils/format';
import type { PagedResult } from '@/libs/types/common';
import type { Faq } from '@/libs/types/faq/faq';

const DEFAULT_LIMIT = 8;
const faqCategories = ['POLICY', 'CLAIMS', 'PAYMENT', 'AGENTS', 'ACCOUNT', 'COMMUNITY', 'OTHER'];
const faqStatuses = ['ACTIVE', 'INACTIVE', 'DELETED'];

const emptyForm = {
  _id: '',
  faqCategory: 'POLICY',
  faqStatus: 'ACTIVE',
  faqQuestion: '',
  faqAnswer: '',
  faqOrder: 0,
};

interface GetAllFaqsByAdminResponse {
  getAllFaqsByAdmin: PagedResult<Faq>;
}

const columns: AdminTableColumn[] = [
  { key: 'question', label: 'Question' },
  { key: 'category', label: 'Category', align: 'center' },
  { key: 'order', label: 'Order', align: 'center' },
  { key: 'status', label: 'Status', align: 'center' },
  { key: 'action', label: 'Action', align: 'center' },
];

const AdminFaqs: NextPage = () => {
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [form, setForm] = useState(emptyForm);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [createFaq] = useMutation(CREATE_FAQ_BY_ADMIN);
  const [updateFaq] = useMutation(UPDATE_FAQ_BY_ADMIN);
  const [removeFaq] = useMutation(REMOVE_FAQ_BY_ADMIN);

  const inquiry = useMemo(() => ({
    page,
    limit,
    sort: 'faqOrder',
    direction: 'ASC',
    search: {
      ...(status !== 'ALL' ? { faqStatus: status } : {}),
      ...(category !== 'ALL' ? { faqCategory: category } : {}),
      ...(submittedText.trim() ? { text: submittedText.trim() } : {}),
    },
  }), [category, limit, page, status, submittedText]);

  const { data, loading, refetch } = useQuery<GetAllFaqsByAdminResponse>(GET_ALL_FAQS_BY_ADMIN, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: { input: inquiry },
  });

  useEffect(() => {
    setFaqs(data?.getAllFaqsByAdmin?.list ?? []);
    setTotal(getTotal(data?.getAllFaqsByAdmin?.metaCounter));
  }, [data]);

  const syncFaqs = () => {
    refetch({ input: inquiry }).catch((error) => console.warn('Admin FAQs refetch failed', error));
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
      faqCategory: form.faqCategory,
      faqQuestion: form.faqQuestion.trim(),
      faqAnswer: form.faqAnswer.trim(),
      faqOrder: Number(form.faqOrder ?? 0),
    };
    if (!payload.faqQuestion || !payload.faqAnswer) return;

    try {
      if (form._id) {
        await updateFaq({ variables: { input: { _id: form._id, ...payload, faqStatus: form.faqStatus } } });
      } else {
        await createFaq({ variables: { input: payload } });
      }
      resetForm();
      syncFaqs();
    } catch (error) {
      console.warn('Admin FAQ save failed', error);
    }
  };

  const updateStatus = async (_id: string, faqStatus: string) => {
    closeMenu();
    setFaqs((prev) => prev.map((faq) => (faq._id === _id ? { ...faq, faqStatus } : faq)));
    try {
      await updateFaq({ variables: { input: { _id, faqStatus } } });
      syncFaqs();
    } catch (error) {
      syncFaqs();
      console.warn('Admin FAQ status update failed', error);
    }
  };

  const remove = async (_id: string, question: string) => {
    if (!window.confirm(`Remove ${question}?`)) return;
    try {
      await removeFaq({ variables: { faqId: _id } });
      syncFaqs();
    } catch (error) {
      syncFaqs();
      console.warn('Admin FAQ remove failed', error);
    }
  };

  const rows: AdminTableRow[] = faqs.map((faq) => ({
    id: faq._id,
    cells: {
      question: (
        <Stack className='admin-table-name admin-text-name'>
          <span>{faq.faqQuestion || 'Untitled FAQ'}</span>
          <small>{faq.faqAnswer || '-'}</small>
        </Stack>
      ),
      category: faq.faqCategory,
      order: faq.faqOrder ?? 0,
      status: (
        <AdminInlineMenu
          anchorEl={anchorEl[`status-${faq._id}`] ?? null}
          label={faq.faqStatus}
          options={faqStatuses.filter((option) => option !== faq.faqStatus)}
          tone={faq.faqStatus === 'ACTIVE' ? 'success' : faq.faqStatus === 'DELETED' ? 'danger' : 'warning'}
          onClose={closeMenu}
          onOpen={(event) => openMenu(`status-${faq._id}`, event)}
          onSelect={(faqStatus) => updateStatus(faq._id, faqStatus)}
        />
      ),
      action: (
        <Stack className='admin-table-actions'>
          <button
            className='admin-icon-action'
            type='button'
            onClick={() => {
              setForm({ ...emptyForm, ...faq });
              focusEditor();
            }}
          >
            <EditOutlinedIcon />
          </button>
          <button className='admin-icon-action danger' type='button' onClick={() => remove(faq._id, faq.faqQuestion)}>
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
            <span>FAQ Editor</span>
            <h2>{form._id ? 'Edit FAQ' : 'Create FAQ'}</h2>
          </Box>
          <Stack className='admin-editor-grid'>
            <select value={form.faqCategory} onChange={(event) => setForm((prev) => ({ ...prev, faqCategory: event.target.value }))}>
              {faqCategories.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            {form._id ? (
              <select value={form.faqStatus} onChange={(event) => setForm((prev) => ({ ...prev, faqStatus: event.target.value }))}>
                {faqStatuses.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : null}
            <input
              min={0}
              placeholder='Display order'
              type='number'
              value={form.faqOrder}
              onChange={(event) => setForm((prev) => ({ ...prev, faqOrder: Number(event.target.value) }))}
            />
            <input
              placeholder='FAQ question'
              value={form.faqQuestion}
              onChange={(event) => setForm((prev) => ({ ...prev, faqQuestion: event.target.value }))}
            />
            <textarea
              placeholder='FAQ answer'
              value={form.faqAnswer}
              onChange={(event) => setForm((prev) => ({ ...prev, faqAnswer: event.target.value }))}
            />
          </Stack>
          <Stack className='admin-editor-actions'>
            <button type='submit'>{form._id ? 'Save FAQ' : 'Create FAQ'}</button>
            {form._id ? <button type='button' onClick={resetForm}>Cancel</button> : null}
          </Stack>
        </Stack>
      </Box>

      <AdminTablePanel
        title='FAQ List'
        description='Create and manage categorized questions shown in the public CS center.'
        tabs={[
          { label: 'All', value: 'ALL' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
          { label: 'Deleted', value: 'DELETED' },
        ]}
        activeTab={status}
        searchText={searchText}
        searchPlaceholder='Search FAQs'
        filterValue={category}
        filterLabel='FAQ category'
        filterOptions={[{ label: 'All', value: 'ALL' }, ...faqCategories.map((value) => ({ label: value, value }))]}
        columns={columns}
        rows={rows}
        loading={loading && faqs.length === 0}
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

export default withLayoutAdmin(AdminFaqs);
