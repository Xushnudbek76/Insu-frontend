import { ChangeEvent } from 'react';
import { Box, Stack } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { ClaimForm } from './types';

interface SubmitClaimPanelProps {
  claimForm: ClaimForm;
  claimError: string | null;
  t: (key: string) => string;
  onClaimChange: (field: keyof ClaimForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onClose: () => void;
  onSubmitClaim: () => void;
}

const SubmitClaimPanel = ({ claimForm, claimError, t, onClaimChange, onClose, onSubmitClaim }: SubmitClaimPanelProps) => (
  <Box className='mypage-claim-overlay'>
    <Stack className='mypage-claim-modal'>
      <Stack className='mypage-panel-head'>
        <span>{t('Submit Claim')}</span>
        <h2>{t('Tell us what happened')}</h2>
      </Stack>
      <Box component='form' className='mypage-form'>
        <label>
          <span>{t('Claim Title')}</span>
          <input value={claimForm.claimTitle} onChange={onClaimChange('claimTitle')} />
        </label>
        <label>
          <span>{t('Claim Amount')}</span>
          <input type='number' min='0' value={claimForm.claimAmount} onChange={onClaimChange('claimAmount')} />
        </label>
        <label>
          <span>{t('Description')}</span>
          <textarea value={claimForm.claimDesc} onChange={onClaimChange('claimDesc')} />
        </label>
        <label>
          <span>{t('Document URLs')}</span>
          <textarea
            value={claimForm.claimDocuments}
            placeholder={t('Optional: one document URL per line')}
            onChange={onClaimChange('claimDocuments')}
          />
        </label>
        {claimError && <p className='mypage-form-error'>{claimError}</p>}
        <Stack className='mypage-actions split'>
          <button type='button' className='ghost' onClick={onClose}>
            {t('Close')}
          </button>
          <button type='button' onClick={onSubmitClaim}>
            <ShieldOutlinedIcon />
            {t('Submit Claim')}
          </button>
        </Stack>
      </Box>
    </Stack>
  </Box>
);

export default SubmitClaimPanel;
