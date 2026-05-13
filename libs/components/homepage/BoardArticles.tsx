import React, { useEffect, useState } from "react";
import { Stack, Box, Typography, Skeleton } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";
import { initializeApollo } from "@/apollo/client";
import { GET_BOARD_ARTICLES } from "@/apollo/board-article/query";
import { BoardArticleCategory } from "@/libs/enums/board-article.enum";

interface ArticleMember {
  _id: string;
  memberNick?: string | null;
  memberImage?: string | null;
}

interface BoardArticleData {
  _id: string;
  articleCategory: BoardArticleCategory;
  articleTitle: string;
  articleContent: string;
  articleImage?: string | null;
  articleViews: number;
  articleLikes: number;
  articleComments: number;
  createdAt: string;
  memberData?: ArticleMember | null;
}

interface GetBoardArticlesResponse {
  getBoardArticles: {
    list: BoardArticleData[];
  };
}

const BoardArticles: React.FC = () => {
  const device = useDeviceDetect();
  const [noticeArticles, setNoticeArticles] = useState<BoardArticleData[]>([]);
  const [freeArticles, setFreeArticles] = useState<BoardArticleData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const client = initializeApollo(null);
    setLoading(true);

    Promise.all([
      client.query<GetBoardArticlesResponse>({
        query: GET_BOARD_ARTICLES,
        variables: {
          input: {
            page: 1,
            limit: 4,
            sort: "createdAt",
            direction: "DESC",
            search: { articleCategory: BoardArticleCategory.NOTICE },
          },
        },
        fetchPolicy: "no-cache",
      }),
      client.query<GetBoardArticlesResponse>({
        query: GET_BOARD_ARTICLES,
        variables: {
          input: {
            page: 1,
            limit: 4,
            sort: "createdAt",
            direction: "DESC",
            search: { articleCategory: BoardArticleCategory.FREE },
          },
        },
        fetchPolicy: "no-cache",
      }),
    ])
      .then(([noticeRes, freeRes]) => {
        setNoticeArticles(noticeRes.data.getBoardArticles.list || []);
        setFreeArticles(freeRes.data.getBoardArticles.list || []);
      })
      .catch((err: any) => {
        console.error("Error, getBoardArticles", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getArticleImage = (image?: string | null) => {
    if (image) return `${process.env.REACT_APP_API_URL}/${image}`;
    return "/img/placeholder-article.svg";
  };

  /* ── Sub-components ───────────────────────────────── */

  const SkeletonCard = () => (
    <Box className={"vertical-card"}>
      <Box className={"article-image-wrapper"}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
      <Skeleton variant="text" sx={{ fontSize: "18px", mt: 1.5 }} />
      <Skeleton variant="text" sx={{ fontSize: "18px", width: "65%" }} />
      <Skeleton
        variant="text"
        sx={{ fontSize: "13px", width: "30%", mt: 0.5 }}
      />
    </Box>
  );

  const renderCard = (article: BoardArticleData, index: number) => (
    <Box key={article._id} className={"vertical-card"}>
      <Box className={"article-image-wrapper"}>
        <Box
          className={"article-image"}
          style={{
            backgroundImage: `url(${getArticleImage(article.articleImage)})`,
          }}
        />
        <Box className={"number-badge"}>{index + 1}</Box>
      </Box>
      <Typography className={"article-title"}>
        {article.articleTitle}
      </Typography>
      <Typography className={"article-label"}>
        {article.articleCategory === BoardArticleCategory.NOTICE
          ? "Notice Board"
          : "Free Board"}
      </Typography>
    </Box>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <Box className={"section-header"}>
      <Typography className={"section-title"}>{label}</Typography>
      <Box className={"view-all"}>
        <Typography className={"view-all-text"}>View All</Typography>
        <ChevronRightIcon className={"view-all-icon"} />
      </Box>
    </Box>
  );

  /* ── Render ───────────────────────────────────────── */

  return (
    <Stack className={"board-articles"}>
      <Stack className={"hero-inner"}>
        <Stack className={"community-main"}>
          {/* Left: Notice */}
          <Stack className={"community-left"}>
            <SectionHeader label="News" />
            <Box className={"articles-grid"}>
              {loading
                ? [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
                : noticeArticles.map((article, index) =>
                    renderCard(article, index),
                  )}
            </Box>
          </Stack>

          {/* Right: Free */}
          <Stack className={"community-right"}>
            <SectionHeader label="Free" />
            <Box className={"articles-grid"}>
              {loading
                ? [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
                : freeArticles.map((article, index) =>
                    renderCard(article, index),
                  )}
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default BoardArticles;
