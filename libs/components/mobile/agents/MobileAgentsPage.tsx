import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { Box, Stack } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useTranslation } from 'next-i18next/pages';
import { formatCount } from '@/libs/utils/format';
import { buildPageNumbers } from '@/libs/utils/pagination';

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
  meLiked?: { myFavorite: boolean }[] | null;
}

interface MobileAgentsPageProps {
  searchText: string;
  sort: string;
  page: number;
  totalPages: number;
  loading: boolean;
  agents: AgentData[];
  likedByAgent: Record<string, boolean>;
  likesByAgent: Record<string, number>;
  sortOptions: { value: string; labelKey: string }[];
  displayName: (agent: AgentData, fallback: string) => string;
  readableStatus: (status?: string | null) => string;
  agentImage: (image?: string | null) => string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearchEnter: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSearchSubmit: () => void;
  onSortChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onToggleLike: (event: MouseEvent, memberId: string) => void;
  onOpenAgent: (memberId: string) => void;
}

const MobileAgentsPage = ({
  searchText,
  sort,
  page,
  totalPages,
  loading,
  agents,
  likedByAgent,
  likesByAgent,
  sortOptions,
  displayName,
  readableStatus,
  agentImage,
  onSearchChange,
  onSearchEnter,
  onSearchSubmit,
  onSortChange,
  onPageChange,
  onToggleLike,
  onOpenAgent,
}: MobileAgentsPageProps) => {
  const { t } = useTranslation('common');

  return (
    <Stack className='mobile-agents-page'>
      <Stack className='mobile-page-hero'>
        <span>{t('Trusted Network')}</span>
        <h1>{t('Agents')}</h1>
        <p>{t('Browse active agents, compare engagement, and open their package listings.')}</p>
      </Stack>

      <Stack className='mobile-community-filters'>
        <div className='mobile-search-box'>
          <SearchOutlinedIcon />
          <input
            type='text'
            value={searchText}
            placeholder={t('Search for an agent')}
            onChange={onSearchChange}
            onKeyDown={onSearchEnter}
          />
          <button onClick={onSearchSubmit}>{t('Go')}</button>
        </div>
        <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </Stack>

      {loading ? (
        <Box className='mobile-agents-list'>
          {Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} className='mobile-agent-card skeleton' />
          ))}
        </Box>
      ) : agents.length === 0 ? (
        <Stack className='mobile-empty-card'>
          <BadgeOutlinedIcon />
          <h2>{t('No agents found')}</h2>
          <p>{t('Try changing your search terms or sorting option.')}</p>
        </Stack>
      ) : (
        <Box className='mobile-agents-list'>
          {agents.map((agent) => {
            const liked = likedByAgent[agent._id] ?? agent.meLiked?.[0]?.myFavorite ?? false;
            const likes = likesByAgent[agent._id] ?? agent.memberLikes;
            return (
              <Stack key={agent._id} className='mobile-agent-card' onClick={() => onOpenAgent(agent._id)}>
                <Box component='img' src={agentImage(agent.memberImage)} alt={displayName(agent, t('Insurance Agent'))} className='mobile-agent-photo' />
                <Stack className='mobile-agent-body'>
                  <div className='mobile-agent-topline'>
                    <strong>{displayName(agent, t('Insurance Agent'))}</strong>
                    <span>{t(readableStatus(agent.memberStatus))}</span>
                  </div>
                  <p>{agent.memberType || t('Insurance Agent')}</p>
                  <Stack className='mobile-agent-stats'>
                    <span>
                      <VisibilityOutlinedIcon />
                      {formatCount(agent.memberViews)}
                    </span>
                    <button onClick={(event) => onToggleLike(event, agent._id)}>
                      {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      {formatCount(likes)}
                    </button>
                    <span>
                      <ChatBubbleIcon />
                      {formatCount(agent.memberComments)}
                    </span>
                  </Stack>
                </Stack>
              </Stack>
            );
          })}
        </Box>
      )}

      {totalPages > 1 && (
        <Box className='mobile-pagination'>
          {buildPageNumbers(page, totalPages).map((pageNumber, index) =>
            pageNumber === '...' ? (
              <span key={`agent-dots-${index}`}>…</span>
            ) : (
              <button
                key={pageNumber}
                className={page === pageNumber ? 'active' : ''}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ),
          )}
        </Box>
      )}
    </Stack>
  );
};

export default MobileAgentsPage;
