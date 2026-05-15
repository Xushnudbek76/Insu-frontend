import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '@/apollo/admin/query';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '@/apollo/admin/mutation';
import AdminResourcePage, { AdminRow } from '@/libs/components/admin/AdminResourcePage';
import { toAssetUrl } from '@/libs/api';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const LIMIT = 8;
const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Deleted', value: 'DELETED' },
];
const CATEGORY_OPTIONS = [
  { label: 'All categories', value: '' },
  { label: 'Notice', value: 'NOTICE' },
  { label: 'Free', value: 'FREE' },
  { label: 'News', value: 'NEWS' },
  { label: 'Review', value: 'REVIEW' },
];

const shortDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : '-');

const AdminCommunity: NextPage = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [updateArticle] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
  const [removeArticle] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

  const variables = useMemo(() => ({
    input: {
      page,
      limit: LIMIT,
      sort: 'createdAt',
      direction: 'DESC',
      search: {
        ...(status ? { articleStatus: status } : {}),
        ...(category ? { articleCategory: category } : {}),
      },
    },
  }), [category, page, status]);

  const { data, loading, refetch } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
    variables,
    fetchPolicy: 'network-only',
  });

  const updateStatus = async (_id: string, articleStatus: string) => {
    await updateArticle({ variables: { input: { _id, articleStatus } } });
    await refetch();
  };

  const remove = async (_id: string, title: string) => {
    if (!window.confirm(`Remove ${title}?`)) return;
    await removeArticle({ variables: { articleId: _id } });
    await refetch();
  };

  const result = data as any;
  const articles = result?.getAllBoardArticlesByAdmin?.list ?? [];
  const total = result?.getAllBoardArticlesByAdmin?.metaCounter?.total ?? 0;
  const normalizedSearch = submittedText.trim().toLowerCase();
  const visibleArticles = normalizedSearch
    ? articles.filter((article: any) => `${article.articleTitle} ${article.memberData?.memberNick}`.toLowerCase().includes(normalizedSearch))
    : articles;

  const rows: AdminRow[] = visibleArticles.map((article: any) => {
    const title = article.articleTitle || 'Community post';

    return {
      id: article._id,
      title,
      subtitle: article.memberData?.memberNick || article.memberId || article._id,
      status: article.articleStatus,
      image: toAssetUrl(article.articleImage) ?? '/img/placeholder-article.svg',
      cells: [
        { label: 'Category', value: article.articleCategory },
        { label: 'Views', value: article.articleViews ?? 0 },
        { label: 'Likes', value: article.articleLikes ?? 0 },
        { label: 'Created', value: shortDate(article.createdAt) },
      ],
      actions: [
        {
          label: 'Active',
          disabled: article.articleStatus === 'ACTIVE',
          onClick: () => updateStatus(article._id, 'ACTIVE'),
        },
        {
          label: 'Inactive',
          tone: 'ghost',
          disabled: article.articleStatus === 'INACTIVE',
          onClick: () => updateStatus(article._id, 'INACTIVE'),
        },
        {
          label: 'Remove',
          tone: 'danger',
          onClick: () => remove(article._id, title),
        },
      ],
    };
  });

  return (
    <AdminResourcePage
      eyebrow='Community'
      title='Community'
      description='Moderate public board articles and keep visible community content healthy.'
      rows={rows}
      loading={loading}
      total={normalizedSearch ? rows.length : total}
      page={page}
      limit={LIMIT}
      searchText={searchText}
      searchPlaceholder='Search loaded articles'
      statusValue={status}
      statusOptions={STATUS_OPTIONS}
      typeValue={category}
      typeOptions={CATEGORY_OPTIONS}
      emptyTitle='No articles found'
      emptyDescription='Try another category or status.'
      onSearchTextChange={setSearchText}
      onSearch={() => {
        setPage(1);
        setSubmittedText(searchText);
      }}
      onStatusChange={(value) => {
        setPage(1);
        setStatus(value);
      }}
      onTypeChange={(value) => {
        setPage(1);
        setCategory(value);
      }}
      onPageChange={setPage}
    />
  );
};

export default withLayoutAdmin(AdminCommunity);
