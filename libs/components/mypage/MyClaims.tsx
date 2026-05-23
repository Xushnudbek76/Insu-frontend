import { Box, Stack } from '@mui/material';
import { ClaimData, formatCurrency, formatDate } from './types';
import MyPageEmpty from './MyPageEmpty';

interface MyClaimsProps {
  claims: ClaimData[];
  loading: boolean;
  error?: string | null;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const MyClaims = ({ claims, loading, error, t }: MyClaimsProps) => (
  <Stack className='mypage-panel'>
    <Stack className='mypage-panel-head'>
      <span>{t('My Claims')}</span>
      <h2>{t('Submitted claims')}</h2>
    </Stack>
    {loading ? (
      <Stack className='mypage-list'>{Array.from({ length: 3 }).map((_, index) => <Box key={index} className='mypage-skeleton-row' />)}</Stack>
    ) : error ? (
      <MyPageEmpty title={t('Could not load claims.')} text={error} />
    ) : claims.length === 0 ? (
      <MyPageEmpty title={t('No claims yet')} text={t('Submit a claim from an active policy when you need support.')} />
    ) : (
      <Stack className='mypage-list'>
        {claims.map((claim) => (
          <Stack key={claim._id} className='mypage-claim-card'>
            <Box className={`mypage-status ${claim.claimStatus.toLowerCase()}`}>{t(claim.claimStatus)}</Box>
            <Stack>
              <h3>{claim.claimTitle}</h3>
              <p>{claim.claimDesc}</p>
              <Box className='mypage-card-meta'>
                <span>{t('Amount')}: {formatCurrency(claim.claimAmount)}</span>
                <span>{t('Policy ID')}: {claim.policyId}</span>
                <span>{formatDate(claim.createdAt)}</span>
              </Box>
              {claim.agentNote && <strong>{t('Agent Note')}: {claim.agentNote}</strong>}
              {claim.aiAnalysis && <strong>{t('AI Analysis')}: {claim.aiAnalysis}</strong>}
            </Stack>
          </Stack>
        ))}
      </Stack>
    )}
  </Stack>
);

export default MyClaims;
