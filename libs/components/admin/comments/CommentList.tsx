import { Box, Stack } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AdminTablePanel, { AdminTableColumn, AdminTableRow } from '@/libs/components/admin/AdminTablePanel';
import { toAssetUrl } from '@/libs/api';

type CommentListProps = {
  comments: any[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  searchText: string;
  onRemoveComment: (_id: string) => void;
  onSearchTextChange: (value: string) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const columns: AdminTableColumn[] = [
  { key: 'author', label: 'Author' },
  { key: 'content', label: 'Content' },
  { key: 'group', label: 'Group', align: 'center' },
  { key: 'status', label: 'Status', align: 'center' },
  { key: 'action', label: 'Action', align: 'center' },
];

const CommentList = ({
  comments,
  loading,
  total,
  page,
  limit,
  searchText,
  onRemoveComment,
  onSearchTextChange,
  onSearch,
  onPageChange,
  onLimitChange,
}: CommentListProps) => {
  const rows: AdminTableRow[] = comments.map((comment) => {
    const author = comment.memberData?.memberNick || '-';
    const image = toAssetUrl(comment.memberData?.memberImage) ?? '/img/profile/defaultUser.svg';

    return {
      id: comment._id,
      cells: {
        author: (
          <Stack className='admin-table-name'>
            <Box component='img' src={image} alt={author} />
            <span>{author}</span>
          </Stack>
        ),
        content: comment.commentContent || '-',
        group: comment.commentGroup || '-',
        status: comment.commentStatus || '-',
        action: (
          <button className='admin-icon-action danger' type='button' onClick={() => onRemoveComment(comment._id)}>
            <DeleteOutlineOutlinedIcon />
          </button>
        ),
      },
    };
  });

  return (
    <AdminTablePanel
      title='Comment List'
      description='Review latest public comments and remove unsafe replies.'
      searchText={searchText}
      searchPlaceholder='Search loaded comments'
      columns={columns}
      rows={rows}
      loading={loading}
      total={total}
      page={page}
      limit={limit}
      emptyText='data not found!'
      onSearchTextChange={onSearchTextChange}
      onSearch={onSearch}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
};

export default CommentList;
