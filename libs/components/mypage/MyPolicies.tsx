import { Box, Stack } from '@mui/material';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { formatCurrency, formatDate, PolicyData } from './types';
import MyPageEmpty from './MyPageEmpty';
import MyPagePagination from './MyPagePagination';

interface MyPoliciesProps {
  policies: PolicyData[];
  loading: boolean;
  error?: string | null;
  policyStatus: string;
  policyPage: number;
  policyTotalPages: number;
  t: (key: string, options?: Record<string, unknown>) => string;
  onPolicyStatusChange: (status: string) => void;
  onOpenClaimPanel: (policyId: string) => void;
  onCancelPolicy: (policyId: string) => void;
  onPageChange: (page: number) => void;
}

const MyPolicies = ({
  policies,
  loading,
  error,
  policyStatus,
  policyPage,
  policyTotalPages,
  t,
  onPolicyStatusChange,
  onOpenClaimPanel,
  onCancelPolicy,
  onPageChange,
}: MyPoliciesProps) => (
  <Stack className='mypage-panel'>
    <Stack className='mypage-panel-head row'>
      <Stack>
        <span>{t('My Policies')}</span>
        <h2>{t('Your active coverage')}</h2>
      </Stack>
      <select value={policyStatus} onChange={(event) => onPolicyStatusChange(event.target.value)}>
        <option value=''>{t('All Statuses')}</option>
        <option value='ACTIVE'>{t('ACTIVE')}</option>
        <option value='CANCELLED'>{t('CANCELLED')}</option>
        <option value='EXPIRED'>{t('EXPIRED')}</option>
        <option value='PENDING'>{t('PENDING')}</option>
      </select>
    </Stack>

    {loading ? (
      <Stack className='mypage-list'>{Array.from({ length: 3 }).map((_, index) => <Box key={index} className='mypage-skeleton-row' />)}</Stack>
    ) : error ? (
      <MyPageEmpty title={t('Could not load policies.')} text={error} />
    ) : policies.length === 0 ? (
      <MyPageEmpty title={t('No policies yet')} text={t('Apply for an insurance package and your policies will appear here.')} />
    ) : (
      <Stack className='mypage-list'>
        {policies.map((policy) => (
          <Stack key={policy._id} className='mypage-policy-card'>
            <Box className={`mypage-status ${policy.policyStatus.toLowerCase()}`}>{t(policy.policyStatus)}</Box>
            <Stack className='mypage-card-main'>
              <h3>{policy.packageName}</h3>
              <p>{t('Policy ID')}: {policy._id}</p>
              <Box className='mypage-card-meta'>
                <span>{t('Premium')}: {formatCurrency(policy.premiumAmount)}</span>
                <span>{t('Start')}: {formatDate(policy.startDate)}</span>
                <span>{t('End')}: {formatDate(policy.endDate)}</span>
              </Box>
            </Stack>
            <Stack className='mypage-card-actions'>
              {policy.policyStatus === 'ACTIVE' && (
                <>
                  <button onClick={() => onOpenClaimPanel(policy._id)}>
                    <AddTaskOutlinedIcon />
                    {t('Submit Claim')}
                  </button>
                  <button className='ghost danger' onClick={() => onCancelPolicy(policy._id)}>
                    <CancelOutlinedIcon />
                    {t('Cancel Policy')}
                  </button>
                </>
              )}
            </Stack>
          </Stack>
        ))}
        <MyPagePagination page={policyPage} totalPages={policyTotalPages} onChange={onPageChange} t={t} />
      </Stack>
    )}
  </Stack>
);

export default MyPolicies;
