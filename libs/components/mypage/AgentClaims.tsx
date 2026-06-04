import { Box, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { ClaimData, ClaimStatus, formatCurrency, formatDate } from './types';
import MyPageEmpty from './MyPageEmpty';
import MyPagePagination from './MyPagePagination';

interface AgentClaimsProps {
  claims: ClaimData[];
  loading: boolean;
  error?: string | null;
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
  error,
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
  <AgentClaimsContent
    claims={claims}
    loading={loading}
    error={error}
    claimStatus={claimStatus}
    claimText={claimText}
    page={page}
    totalPages={totalPages}
    t={t}
    onTextChange={onTextChange}
    onStatusChange={onStatusChange}
    onUpdateClaimStatus={onUpdateClaimStatus}
    onPageChange={onPageChange}
  />
);

const AgentClaimsContent = ({
  claims,
  loading,
  error,
  claimStatus,
  claimText,
  page,
  totalPages,
  t,
  onTextChange,
  onStatusChange,
  onUpdateClaimStatus,
  onPageChange,
}: AgentClaimsProps) => {
  const router = useRouter();

  return (
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
    ) : error ? (
      <MyPageEmpty title={t('Could not load agent claims.')} text={error} />
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
                <span>{formatDate(claim.createdAt, router.locale)}</span>
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
};

export default AgentClaims;
