import { Box, Stack } from '@mui/material';
import { ClaimData, ClaimStatus, formatCurrency, formatDate } from './types';
import MyPageEmpty from './MyPageEmpty';
import MyPagePagination from './MyPagePagination';

interface AgentClaimsProps {
  claims: ClaimData[];
  loading: boolean;
  claimStatus: string;
  claimText: string;
  page: number;
  totalPages: number;
  t: (key: string, options?: Record<string, unknown>) => string;
  onTextChange: (text: string) => void;
  onStatusChange: (status: string) => void;
  onUpdateClaimStatus: (claimId: string, newStatus: ClaimStatus) => void;
  onPageChange: (page: number) => void;
}

const AgentClaims = ({
  claims,
  loading,
  claimStatus,
  claimText,
  page,
  totalPages,
  t,
  onTextChange,
  onStatusChange,
  onUpdateClaimStatus,
  onPageChange,
}: AgentClaimsProps) => (
  <Stack className='mypage-panel'>
    <Stack className='mypage-panel-head row'>
      <Stack>
        <span>{t('Agent Claims')}</span>
        <h2>{t('Claims assigned to you')}</h2>
      </Stack>
      <Stack className='mypage-filter-row'>
        <input value={claimText} placeholder={t('Search claims')} onChange={(event) => onTextChange(event.target.value)} />
        <select value={claimStatus} onChange={(event) => onStatusChange(event.target.value)}>
          <option value=''>{t('All Statuses')}</option>
          <option value='PENDING'>{t('PENDING')}</option>
          <option value='APPROVED'>{t('APPROVED')}</option>
          <option value='REJECTED'>{t('REJECTED')}</option>
          <option value='SETTLED'>{t('SETTLED')}</option>
        </select>
      </Stack>
    </Stack>

    {loading ? (
      <Stack className='mypage-list'>{Array.from({ length: 3 }).map((_, index) => <Box key={index} className='mypage-skeleton-row' />)}</Stack>
    ) : claims.length === 0 ? (
      <MyPageEmpty title={t('No assigned claims')} text={t('Claims for your packages will appear here.')} />
    ) : (
      <Stack className='mypage-list'>
        {claims.map((claim) => (
          <Stack key={claim._id} className='mypage-claim-card agent'>
            <Box className={`mypage-status ${claim.claimStatus.toLowerCase()}`}>{t(claim.claimStatus)}</Box>
            <Stack>
              <h3>{claim.claimTitle}</h3>
              <p>{claim.claimDesc}</p>
              <Box className='mypage-card-meta'>
                <span>{t('Amount')}: {formatCurrency(claim.claimAmount)}</span>
                <span>{t('Policy ID')}: {claim.policyId}</span>
                <span>{formatDate(claim.createdAt)}</span>
              </Box>
              {claim.aiAnalysis && <strong>{t('AI Analysis')}: {claim.aiAnalysis}</strong>}
            </Stack>
            <Stack className='mypage-card-actions'>
              {(['APPROVED', 'REJECTED', 'SETTLED'] as ClaimStatus[]).map((status) => (
                <button key={status} className='ghost' onClick={() => onUpdateClaimStatus(claim._id, status)}>
                  {t(status)}
                </button>
              ))}
            </Stack>
          </Stack>
        ))}
        <MyPagePagination page={page} totalPages={totalPages} onChange={onPageChange} t={t} />
      </Stack>
    )}
  </Stack>
);

export default AgentClaims;
