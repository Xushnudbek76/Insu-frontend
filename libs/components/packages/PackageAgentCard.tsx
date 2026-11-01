import { Box, Avatar } from '@mui/material';
import { useTranslation } from 'next-i18next/pages';
import { getMemberImage } from './helpers';
import type { MemberData } from './types';

interface PackageAgentCardProps {
  agent: MemberData;
}

const PackageAgentCard = ({ agent }: PackageAgentCardProps) => {
  const { t } = useTranslation('common');

  return (
    <Box className={'pd-agent-card'}>
      <span className={'pd-agent-label'}>{t('OFFERED BY')}</span>
      <Box className={'pd-agent-info'}>
        <Avatar
          src={getMemberImage(agent.memberImage)}
          sx={{ width: 56, height: 56 }}
        />
        <Box className={'pd-agent-text'}>
          <span className={'pd-agent-name'}>{agent.memberFullName || agent.memberNick}</span>
          <span className={'pd-agent-role'}>{t('Insurance Agent')}</span>
        </Box>
      </Box>
    </Box>
  );
};

export default PackageAgentCard;
