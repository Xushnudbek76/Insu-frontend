import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ADMIN_LATEST_COMMENTS } from '@/apollo/admin/query';
import { REMOVE_COMMENT_BY_ADMIN } from '@/apollo/admin/mutation';
import AdminResourcePage, { AdminRow } from '@/libs/components/admin/AdminResourcePage';
import { toAssetUrl } from '@/libs/api';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const LIMIT = 8;
const shortDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : '-');

const AdminComments: NextPage = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [removeComment] = useMutation(REMOVE_COMMENT_BY_ADMIN);

  const variables = useMemo(() => ({
    input: {
      page,
      limit: LIMIT,
      sort: 'createdAt',
      direction: 'DESC',
    },
  }), [page]);

  const { data, loading, refetch } = useQuery(GET_ADMIN_LATEST_COMMENTS, {
    variables,
    fetchPolicy: 'network-only',
  });

  const remove = async (_id: string) => {
    if (!window.confirm('Remove this comment?')) return;
    await removeComment({ variables: { commentId: _id } });
    await refetch();
  };

  const result = data as any;
  const comments = result?.getLatestComments?.list ?? [];
  const total = result?.getLatestComments?.metaCounter?.total ?? 0;
  const normalizedSearch = submittedText.trim().toLowerCase();
  const visibleComments = normalizedSearch
    ? comments.filter((comment: any) => `${comment.commentContent} ${comment.memberData?.memberNick}`.toLowerCase().includes(normalizedSearch))
    : comments;

  const rows: AdminRow[] = visibleComments.map((comment: any) => ({
    id: comment._id,
    title: comment.commentContent || 'Comment',
    subtitle: comment.memberData?.memberNick || comment.memberId || comment._id,
    status: comment.commentStatus,
    image: toAssetUrl(comment.memberData?.memberImage) ?? '/img/profile/defaultUser.svg',
    cells: [
      { label: 'Group', value: comment.commentGroup },
      { label: 'Reference', value: comment.commentRefId },
      { label: 'Author', value: comment.memberData?.memberNick || '-' },
      { label: 'Created', value: shortDate(comment.createdAt) },
    ],
    actions: [
      {
        label: 'Remove',
        tone: 'danger',
        onClick: () => remove(comment._id),
      },
    ],
  }));

  return (
    <AdminResourcePage
      eyebrow='Moderation'
      title='Comments'
      description='Review latest public comments and remove unsafe or irrelevant replies.'
      rows={rows}
      loading={loading}
      total={normalizedSearch ? rows.length : total}
      page={page}
      limit={LIMIT}
      searchText={searchText}
      searchPlaceholder='Search loaded comments'
      emptyTitle='No comments found'
      emptyDescription='Latest active comments will appear here.'
      onSearchTextChange={setSearchText}
      onSearch={() => {
        setPage(1);
        setSubmittedText(searchText);
      }}
      onPageChange={setPage}
    />
  );
};

export default withLayoutAdmin(AdminComments);
