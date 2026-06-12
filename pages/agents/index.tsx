import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useMemo,
  useState,
} from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client/react";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import withLayoutMain from "@/layout/LayoutHome";
import { userVar } from "@/apollo/store";
import { LIKE_TARGET_MEMBER } from "@/apollo/member/mutation";
import { GET_AGENTS } from "@/apollo/user/query";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";
import { getMeLiked, useLikeToggleMap } from "@/libs/hooks/useLikeToggle";
import type { LikeState } from "@/libs/types/common";
import MobileAgentsPage from "@/libs/components/mobile/agents/MobileAgentsPage";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { toAssetUrl } from "@/libs/api";
import type { PagedResult } from "@/libs/types/common";
import type { MemberSummary } from "@/libs/types/member/member";
import { formatCount } from "@/libs/utils/format";
import { buildPageNumbers } from "@/libs/utils/pagination";

const LIMIT = 10;

const SORT_OPTIONS = [
  { value: "createdAt", labelKey: "Recent" },
  { value: "memberViews", labelKey: "Most Views" },
  { value: "memberLikes", labelKey: "Most Likes" },
  { value: "memberComments", labelKey: "Most Comments" },
];

type AgentData = MemberSummary;

interface GetAgentsResponse {
  getAgents: PagedResult<AgentData>;
}

const displayName = (agent: AgentData, fallback: string) =>
  agent.memberNick || agent.memberFullName || fallback;

const agentImage = (image?: string | null) =>
  toAssetUrl(image) ?? "/img/placeholder-article.svg";

const readableStatus = (status?: string | null) =>
  status
    ? status.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())
    : "Active";

const AgentsPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const device = useDeviceDetect();
  const [searchText, setSearchText] = useState("");
  const [appliedSearchText, setAppliedSearchText] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [page, setPage] = useState(1);

  const { loading, data } = useQuery<GetAgentsResponse>(GET_AGENTS, {
    fetchPolicy: "cache-first",
    variables: {
      input: {
        page,
        limit: LIMIT,
        sort,
        direction: "DESC",
        search: appliedSearchText.trim()
          ? { text: appliedSearchText.trim() }
          : {},
      },
    },
  });
  
  const [likeTargetMember] = useMutation<{ likeTargetMember: AgentData }>(
    LIKE_TARGET_MEMBER,
  );

  const agents = data?.getAgents.list ?? [];
  const total = data?.getAgents.metaCounter?.[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const agentLikeSourceStates = useMemo<Record<string, LikeState>>(
    () =>
      Object.fromEntries(
        agents.map((agent) => [
          agent._id,
          {
            liked: getMeLiked(agent.meLiked),
            count: agent.memberLikes ?? 0,
          },
        ]),
      ),
    [agents],
  );

  const agentLikes = useLikeToggleMap({
    sourceStates: agentLikeSourceStates,
    isAuthenticated: () => Boolean(userVar()?._id),
    onUnauthenticated: () => sweetMixinErrorAlert(t("Please login to like agents.")),
    mutate: async (memberId, optimistic) => {
      const result = await likeTargetMember({
        variables: { input: memberId },
      });
      const updated = result.data?.likeTargetMember;
      if (!updated) return null;

      return {
        liked: optimistic.liked,
        count: updated.memberLikes ?? optimistic.count,
      };
    },
    onError: (message) => sweetMixinErrorAlert(message),
    errorMessage: t("Could not update likes."),
  });

  const agentLikeStates = useMemo<Record<string, LikeState>>(
    () =>
      Object.fromEntries(
        agents.map((agent) => [agent._id, agentLikes.getState(agent._id)]),
      ),
    [agents, agentLikes.getState],
  );

  const handleSearchSubmit = () => {
    setPage(1);
    setAppliedSearchText(searchText);
  };

  const handleSearchEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSearchSubmit();
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleToggleLike = (event: MouseEvent, memberId: string) => {
    event.stopPropagation();
    void agentLikes.toggle(memberId);
  };

  if (device === "mobile") {
    return (
      <MobileAgentsPage
        searchText={searchText}
        sort={sort}
        page={page}
        totalPages={totalPages}
        loading={loading}
        agents={agents}
        agentLikeStates={agentLikeStates}
        sortOptions={SORT_OPTIONS}
        displayName={displayName}
        readableStatus={readableStatus}
        agentImage={agentImage}
        onSearchChange={handleSearchChange}
        onSearchEnter={handleSearchEnter}
        onSearchSubmit={handleSearchSubmit}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onToggleLike={handleToggleLike}
        onOpenAgent={(memberId) => router.push(`/agents/${memberId}`)}
      />
    );
  }

  return (
    <Stack className="agents-page">
      <Stack className="agents-hero">
        <Box className="agents-hero-shade" />
        <Stack className="agents-shell agents-hero-content">
          <span className="agents-eyebrow">{t("Trusted Network")}</span>
          <h1>{t("Agents")}</h1>
          <p>{t("Home / Agents")}</p>
        </Stack>
      </Stack>

      <Stack className="agents-shell agents-main">
        <Stack className="agents-toolbar">
          <Stack className="agents-search-box">
            <SearchOutlinedIcon />
            <input
              type="text"
              value={searchText}
              placeholder={t("Search for an agent")}
              onChange={handleSearchChange}
              onKeyDown={handleSearchEnter}
            />
            <button onClick={handleSearchSubmit}>{t("Search")}</button>
          </Stack>

          <Stack className="agents-sort-box">
            <span>{t("Sort by")}</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </Stack>
        </Stack>

        {loading ? (
          <Box className="agents-grid">
            {Array.from({ length: LIMIT }).map((_, index) => (
              <Stack key={index} className="agent-card skeleton">
                <Box className="agent-image-wrap skeleton-block" />
                <Stack className="agent-card-body">
                  <Box className="skeleton-line wide" />
                  <Box className="skeleton-line short" />
                  <Box className="skeleton-line medium" />
                </Stack>
              </Stack>
            ))}
          </Box>
        ) : agents.length === 0 ? (
          <Stack className="agents-empty">
            <BadgeOutlinedIcon />
            <h2>{t("No agents found")}</h2>
            <p>{t("Try changing your search terms or sorting option.")}</p>
          </Stack>
        ) : (
          <Box className="agents-grid">
            {agents.map((agent) => {
              const likeState = agentLikeStates[agent._id] ?? {
                liked: getMeLiked(agent.meLiked),
                count: agent.memberLikes ?? 0,
              };

              return (
                <Stack
                  key={agent._id}
                  className="agent-card"
                  onClick={() => router.push(`/agents/${agent._id}`)}
                >
                  <Box className="agent-image-wrap">
                    <Box
                      component="img"
                      src={agentImage(agent.memberImage)}
                      alt={displayName(agent, t("Insurance Agent"))}
                      className="agent-image"
                    />
                    <span className="agent-status-badge">
                      {t(readableStatus(agent.memberStatus))}
                    </span>
                  </Box>

                  <Stack className="agent-card-body">
                    <Stack className="agent-title-row">
                      <Box>
                        <h3>{displayName(agent, t("Insurance Agent"))}</h3>
                        <p>{agent.memberType || t("Insurance Agent")}</p>
                      </Box>
                    </Stack>

                    <Stack className="agent-card-stats">
                      <Stack className="agent-stat">
                        <VisibilityOutlinedIcon />
                        <span>{formatCount(agent.memberViews)}</span>
                      </Stack>
                      <button
                        type="button"
                        className={`agent-stat like${likeState.liked ? " liked" : ""}`}
                        onClick={(event) => handleToggleLike(event, agent._id)}
                      >
                        {likeState.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        <span>{formatCount(likeState.count)}</span>
                      </button>
                      <Stack className="agent-stat comments">
                        <ChatBubbleIcon />
                        <span>{formatCount(agent.memberComments)}</span>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              );
            })}
          </Box>
        )}

        <Stack className="agents-footer-row">
          <p>
            {t("Total agents available", {
              count: total,
              plural: total !== 1 ? "s" : "",
            })}
          </p>

          {totalPages > 1 && (
            <Stack className="agents-pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                <ChevronLeftIcon />
              </button>

              {buildPageNumbers(page, totalPages).map((item, index) =>
                item === "..." ? (
                  <span key={`dots-${index}`}>...</span>
                ) : (
                  <button
                    key={item}
                    className={page === item ? "active" : ""}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                <ChevronRightIcon />
              </button>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default withLayoutMain(AgentsPage);

export const getStaticProps = async ({
  locale = "en",
}: {
  locale?: string;
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});
