import { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ADMIN_LATEST_COMMENTS } from '@/apollo/admin/query';
import { REMOVE_COMMENT_BY_ADMIN } from '@/apollo/admin/mutation';
import CommentList from '@/libs/components/admin/comments/CommentList';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const DEFAULT_LIMIT = 8;
const getTotal = (metaCounter: any) => metaCounter?.total ?? metaCounter?.[0]?.total ?? 0;

const AdminComments: NextPage = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [removeComment] = useMutation(REMOVE_COMMENT_BY_ADMIN);

  const inquiry = useMemo(() => ({
    page,
    limit,
    sort: 'createdAt',
    direction: 'DESC',
  }), [limit, page]);

  const { data, loading, refetch } = useQuery(GET_ADMIN_LATEST_COMMENTS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: { input: inquiry },
  });

  useEffect(() => {
    const result = data as any;
    setComments(result?.getLatestComments?.list ?? []);
    setCommentsTotal(getTotal(result?.getLatestComments?.metaCounter));
  }, [data]);

  const syncComments = () => {
    refetch({ input: inquiry }).catch((error) => console.warn('Admin comments refetch failed', error));
  };

  const remove = async (_id: string) => {
    if (!window.confirm('Remove this comment?')) return;
    try {
      await removeComment({ variables: { commentId: _id } });
      setComments((prev) => prev.filter((comment) => comment._id !== _id));
      syncComments();
    } catch (error) {
      syncComments();
      console.warn('Admin comment remove failed', error);
    }
  };

  const normalizedSearch = submittedText.trim().toLowerCase();
  const visibleComments = normalizedSearch
    ? comments.filter((comment) => `${comment.commentContent} ${comment.memberData?.memberNick}`.toLowerCase().includes(normalizedSearch))
    : comments;

  return (
    <CommentList
      comments={visibleComments}
      loading={loading && comments.length === 0}
      total={normalizedSearch ? visibleComments.length : commentsTotal}
      page={page}
      limit={limit}
      searchText={searchText}
      onRemoveComment={remove}
      onSearchTextChange={setSearchText}
      onSearch={() => {
        setPage(1);
        setSubmittedText(searchText);
      }}
      onPageChange={setPage}
      onLimitChange={(nextLimit) => {
        setPage(1);
        setLimit(nextLimit);
      }}
    />
  );
};

export default withLayoutAdmin(AdminComments);
