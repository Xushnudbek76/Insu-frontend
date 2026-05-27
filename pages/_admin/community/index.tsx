import { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '@/apollo/admin/query';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '@/apollo/admin/mutation';
import CommunityArticleList from '@/libs/components/admin/community/CommunityArticleList';
import withLayoutAdmin from '@/layout/LayoutAdmin';
import { getTotal } from '@/libs/utils/format';
import type { BoardArticle } from '@/libs/types/board-article/board-article';
import type { PagedResult } from '@/libs/types/common';

const DEFAULT_LIMIT = 8;

interface GetAllBoardArticlesByAdminResponse {
  getAllBoardArticlesByAdmin: PagedResult<BoardArticle>;
}

interface UpdateBoardArticleByAdminResponse {
  updateBoardArticleByAdmin: BoardArticle;
}

const AdminCommunity: NextPage = () => {
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});
  const [articles, setArticles] = useState<BoardArticle[]>([]);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [updateArticle] = useMutation<UpdateBoardArticleByAdminResponse>(UPDATE_BOARD_ARTICLE_BY_ADMIN);
  const [removeArticle] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

  const inquiry = useMemo(() => ({
    page,
    limit,
    sort: 'createdAt',
    direction: 'DESC',
    search: {
      ...(status !== 'ALL' ? { articleStatus: status } : {}),
      ...(category !== 'ALL' ? { articleCategory: category } : {}),
    },
  }), [category, limit, page, status]);

  const { data, loading, refetch } = useQuery<GetAllBoardArticlesByAdminResponse>(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: { input: inquiry },
  });

  useEffect(() => {
    setArticles(data?.getAllBoardArticlesByAdmin?.list ?? []);
    setArticlesTotal(getTotal(data?.getAllBoardArticlesByAdmin?.metaCounter));
  }, [data]);

  const openMenu = (key: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl({ [key]: event.currentTarget });
  };

  const closeMenu = () => setAnchorEl({});

  const syncArticles = () => {
    refetch({ input: inquiry }).catch((error) => console.warn('Admin articles refetch failed', error));
  };

  const updateStatus = async (_id: string, articleStatus: string) => {
    closeMenu();
    setArticles((prev) => prev.map((article) => (article._id === _id ? { ...article, articleStatus } : article)));
    try {
      const result = await updateArticle({ variables: { input: { _id, articleStatus } } });
      const updated = result.data?.updateBoardArticleByAdmin;
      if (updated) setArticles((prev) => prev.map((article) => (article._id === _id ? { ...article, ...updated } : article)));
      syncArticles();
    } catch (error) {
      syncArticles();
      console.warn('Admin article update failed', error);
    }
  };

  const remove = async (_id: string, title: string) => {
    if (!window.confirm(`Remove ${title}?`)) return;
    try {
      await removeArticle({ variables: { articleId: _id } });
      setArticles((prev) => prev.filter((article) => article._id !== _id));
      syncArticles();
    } catch (error) {
      syncArticles();
      console.warn('Admin article remove failed', error);
    }
  };

  return (
    <CommunityArticleList
      articles={articles}
      loading={loading && articles.length === 0}
      total={articlesTotal}
      page={page}
      limit={limit}
      activeStatus={status}
      categoryFilter={category}
      anchorEl={anchorEl}
      onOpenMenu={openMenu}
      onCloseMenu={closeMenu}
      onUpdateArticle={updateStatus}
      onRemoveArticle={remove}
      onStatusTabChange={(value) => {
        setPage(1);
        setStatus(value);
      }}
      onCategoryFilterChange={(value) => {
        setPage(1);
        setCategory(value);
      }}
      onPageChange={setPage}
      onLimitChange={(nextLimit) => {
        setPage(1);
        setLimit(nextLimit);
      }}
    />
  );
};

export default withLayoutAdmin(AdminCommunity);
