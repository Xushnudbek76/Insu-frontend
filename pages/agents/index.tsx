import { ChangeEvent, KeyboardEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Box, Stack } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import withLayoutMain from '@/layout/LayoutHome';
import { userVar } from '@/apollo/store';
import { LIKE_TARGET_MEMBER } from '@/apollo/member/mutation';
import { GET_AGENTS } from '@/apollo/user/query';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
import { toAssetUrl } from '@/libs/api';

const LIMIT = 10;

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Recent' },
  { value: 'memberViews', label: 'Most Views' },
  { value: 'memberLikes', label: 'Most Likes' },
  { value: 'memberComments', label: 'Most Comments' },
];

interface AgentData {
  _id: string;
  memberType?: string | null;
  memberStatus?: string | null;
  memberNick?: string | null;
  memberFullName?: string | null;
  memberImage?: string | null;
  memberLikes?: number | null;
  memberViews?: number | null;
  memberComments?: number | null;
  meLiked?: { memberId?: string | null; likeRefId?: string | null; myFavorite: boolean }[] | null;
}

interface GetAgentsResponse {
  getAgents: {
    list: AgentData[];
    metaCounter: { total: number }[];
  };
}

const formatCount = (value?: number | null) =>
  value == null ? '0' : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

const displayName = (agent: AgentData) =>
  agent.memberNick || agent.memberFullName || 'Insurance Agent';

const agentImage = (image?: string | null) =>
  toAssetUrl(image) ?? '/img/placeholder-article.svg';

const readableStatus = (status?: string | null) =>
  status ? status.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()) : 'Active';

const AgentsPage: NextPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [appliedSearchText, setAppliedSearchText] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [likedByAgent, setLikedByAgent] = useState<Record<string, boolean>>({});
  const [likesByAgent, setLikesByAgent] = useState<Record<string, number>>({});

  const { loading, data, refetch } = useQuery<GetAgentsResponse>(GET_AGENTS, {
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        page,
        limit: LIMIT,
        sort,
        direction: 'DESC',
        search: appliedSearchText.trim() ? { text: appliedSearchText.trim() } : {},
      },
    },
  });
  const [likeTargetMember] = useMutation<{ likeTargetMember: AgentData }>(LIKE_TARGET_MEMBER);

  const agents = data?.getAgents.list ?? [];
  const total = data?.getAgents.metaCounter?.[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    if (!agents.length) return;

    setLikedByAgent((prev) => {
      const next = { ...prev };
      agents.forEach((agent) => {
        const apiLiked = agent.meLiked?.[0]?.myFavorite;
        if (typeof apiLiked === 'boolean') next[agent._id] = apiLiked;
      });
      return next;
    });
  }, [agents]);

  const handleSearchSubmit = () => {
    setPage(1);
    setAppliedSearchText(searchText);
  };

  const handleSearchEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSearchSubmit();
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleToggleLike = async (event: MouseEvent, memberId: string) => {
    event.stopPropagation();

    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert('Please login to like agents.');
      return;
    }

    const agent = agents.find((item) => item._id === memberId);
    const currentLiked = likedByAgent[memberId] ?? agent?.meLiked?.[0]?.myFavorite ?? false;
    const currentLikes = likesByAgent[memberId] ?? agent?.memberLikes ?? 0;
    const nextLiked = !currentLiked;
    const nextLikes = Math.max(0, currentLikes + (nextLiked ? 1 : -1));

    setLikedByAgent((prev) => ({ ...prev, [memberId]: nextLiked }));
    setLikesByAgent((prev) => ({ ...prev, [memberId]: nextLikes }));

    try {
      const result = await likeTargetMember({
        variables: { input: memberId },
      });
      const updated = result.data?.likeTargetMember;
      if (updated) {
        setLikesByAgent((prev) => ({
          ...prev,
          [memberId]: updated.memberLikes ?? nextLikes,
        }));
      }
      await refetch();
      await sweetTopSuccessAlert('Updated your favorites.');
    } catch (err: any) {
      setLikedByAgent((prev) => ({ ...prev, [memberId]: currentLiked }));
      setLikesByAgent((prev) => ({ ...prev, [memberId]: currentLikes }));
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ??
          err?.message ??
          'Could not update likes.',
      );
    }
  };

  const buildPageNumbers = (): Array<number | '...'> => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const pages: Array<number | '...'> = [1];
    if (page > 3) pages.push('...');

    for (
      let currentPage = Math.max(2, page - 1);
      currentPage <= Math.min(totalPages - 1, page + 1);
      currentPage += 1
    ) {
      pages.push(currentPage);
    }

    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <Stack className='agents-page'>
      <Stack className='agents-hero'>
        <Box className='agents-hero-shade' />
        <Stack className='agents-shell agents-hero-content'>
          <span className='agents-eyebrow'>Trusted Network</span>
          <h1>Agents</h1>
          <p>Home / Agents</p>
        </Stack>
      </Stack>

      <Stack className='agents-shell agents-main'>
        <Stack className='agents-toolbar'>
          <Stack className='agents-search-box'>
            <SearchOutlinedIcon />
            <input
              type='text'
              value={searchText}
              placeholder='Search for an agent'
              onChange={handleSearchChange}
              onKeyDown={handleSearchEnter}
            />
            <button onClick={handleSearchSubmit}>Search</button>
          </Stack>

          <Stack className='agents-sort-box'>
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Stack>
        </Stack>

        {loading ? (
          <Box className='agents-grid'>
            {Array.from({ length: LIMIT }).map((_, index) => (
              <Stack key={index} className='agent-card skeleton'>
                <Box className='agent-image-wrap skeleton-block' />
                <Stack className='agent-card-body'>
                  <Box className='skeleton-line wide' />
                  <Box className='skeleton-line short' />
                  <Box className='skeleton-line medium' />
                </Stack>
              </Stack>
            ))}
          </Box>
        ) : agents.length === 0 ? (
          <Stack className='agents-empty'>
            <BadgeOutlinedIcon />
            <h2>No agents found</h2>
            <p>Try changing your search terms or sorting option.</p>
          </Stack>
        ) : (
          <Box className='agents-grid'>
            {agents.map((agent) => {
              const liked = likedByAgent[agent._id] ?? agent.meLiked?.[0]?.myFavorite ?? false;
              const likes = likesByAgent[agent._id] ?? agent.memberLikes;

              return (
                <Stack
                  key={agent._id}
                  className='agent-card'
                  onClick={() => router.push(`/agents/${agent._id}`)}
                >
                  <Box className='agent-image-wrap'>
                    <Box
                      component='img'
                      src={agentImage(agent.memberImage)}
                      alt={displayName(agent)}
                      className='agent-image'
                    />
                    <span className='agent-status-badge'>{readableStatus(agent.memberStatus)}</span>
                  </Box>

                  <Stack className='agent-card-body'>
                    <Stack className='agent-title-row'>
                      <Box>
                        <h3>{displayName(agent)}</h3>
                        <p>{agent.memberType || 'Insurance Agent'}</p>
                      </Box>
                    </Stack>

                    <Stack className='agent-card-stats'>
                      <Stack className='agent-stat'>
                        <VisibilityOutlinedIcon />
                        <span>{formatCount(agent.memberViews)}</span>
                      </Stack>
                      <button
                        type='button'
                        className={`agent-stat like${liked ? ' liked' : ''}`}
                        onClick={(event) => handleToggleLike(event, agent._id)}
                      >
                        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        <span>{formatCount(likes)}</span>
                      </button>
                      <Stack className='agent-stat comments'>
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

        <Stack className='agents-footer-row'>
          <p>
            Total <strong>{total}</strong> agent{total !== 1 ? 's' : ''} available
          </p>

          {totalPages > 1 && (
            <Stack className='agents-pagination'>
              <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                <ChevronLeftIcon />
              </button>

              {buildPageNumbers().map((item, index) =>
                item === '...' ? (
                  <span key={`dots-${index}`}>...</span>
                ) : (
                  <button
                    key={item}
                    className={page === item ? 'active' : ''}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}

              <button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
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
