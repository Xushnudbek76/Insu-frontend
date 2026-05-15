import Link from 'next/link';
import { Box, Stack } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AdminTablePanel, { AdminInlineMenu, AdminTableColumn, AdminTableRow } from '@/libs/components/admin/AdminTablePanel';
import { toAssetUrl } from '@/libs/api';

type CommunityArticleListProps = {
  articles: any[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  activeStatus: string;
  categoryFilter: string;
  anchorEl: Record<string, HTMLElement | null>;
  onOpenMenu: (key: string, event: React.MouseEvent<HTMLButtonElement>) => void;
  onCloseMenu: () => void;
  onUpdateArticle: (_id: string, articleStatus: string) => void;
  onRemoveArticle: (_id: string, title: string) => void;
  onStatusTabChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const columns: AdminTableColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', align: 'center' },
  { key: 'author', label: 'Author', align: 'center' },
  { key: 'stats', label: 'Stats', align: 'center' },
  { key: 'status', label: 'Status', align: 'center' },
];

const statusOptions = ['ACTIVE', 'INACTIVE', 'DELETED'];

const CommunityArticleList = ({
  articles,
  loading,
  total,
  page,
  limit,
  activeStatus,
  categoryFilter,
  anchorEl,
  onOpenMenu,
  onCloseMenu,
  onUpdateArticle,
  onRemoveArticle,
  onStatusTabChange,
  onCategoryFilterChange,
  onPageChange,
  onLimitChange,
}: CommunityArticleListProps) => {
  const rows: AdminTableRow[] = articles.map((article) => {
    const title = article.articleTitle || 'Community post';
    const image = toAssetUrl(article.articleImage) ?? '/img/placeholder-article.svg';

    return {
      id: article._id,
      cells: {
        title: (
          <Stack className='admin-table-name'>
            <Link href={`/community/${article._id}`}>
              <Box component='img' src={image} alt={title} />
            </Link>
            <Link href={`/community/${article._id}`}>{title}</Link>
          </Stack>
        ),
        category: article.articleCategory,
        author: article.memberData?.memberNick || '-',
        stats: `${article.articleViews ?? 0} views / ${article.articleLikes ?? 0} likes`,
        status: article.articleStatus === 'DELETED' ? (
          <button className='admin-icon-action danger' type='button' onClick={() => onRemoveArticle(article._id, title)}>
            <DeleteOutlineOutlinedIcon />
          </button>
        ) : (
          <AdminInlineMenu
            anchorEl={anchorEl[`status-${article._id}`] ?? null}
            label={article.articleStatus}
            options={statusOptions.filter((status) => status !== article.articleStatus)}
            tone={article.articleStatus === 'ACTIVE' ? 'success' : 'warning'}
            onClose={onCloseMenu}
            onOpen={(event) => onOpenMenu(`status-${article._id}`, event)}
            onSelect={(articleStatus) => onUpdateArticle(article._id, articleStatus)}
          />
        ),
      },
    };
  });

  return (
    <AdminTablePanel
      title='Community List'
      description='Moderate public board articles and keep community content healthy.'
      tabs={[
        { label: 'All', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Deleted', value: 'DELETED' },
      ]}
      activeTab={activeStatus}
      filterValue={categoryFilter}
      filterLabel='Article category'
      filterOptions={[
        { label: 'All', value: 'ALL' },
        { label: 'Notice', value: 'NOTICE' },
        { label: 'Free', value: 'FREE' },
        { label: 'News', value: 'NEWS' },
        { label: 'Review', value: 'REVIEW' },
      ]}
      columns={columns}
      rows={rows}
      loading={loading}
      total={total}
      page={page}
      limit={limit}
      emptyText='data not found!'
      onTabChange={onStatusTabChange}
      onFilterChange={onCategoryFilterChange}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
};

export default CommunityArticleList;
