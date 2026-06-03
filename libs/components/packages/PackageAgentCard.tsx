import { Box, Avatar } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import { getMemberImage } from './helpers';
import type { MemberData } from './types';

interface PackageAgentCardProps {
  agent: MemberData;
}

const PackageAgentCard = ({ agent }: PackageAgentCardProps) => (
  <Box className={'pd-agent-card'}>
    <span className={'pd-agent-label'}>OFFERED BY</span>
    <Box className={'pd-agent-info'}>
      <Avatar
        src={getMemberImage(agent.memberImage)}
        sx={{ width: 56, height: 56 }}
      />
      <Box className={'pd-agent-text'}>
        <span className={'pd-agent-name'}>{agent.memberNick}</span>
        <span className={'pd-agent-role'}>Insurance Agent</span>
      </Box>
    </Box>
    <Box className={'pd-agent-meta'}>
      <span className={'pd-agent-badge'}>
        <VerifiedIcon /> Identity Verified
      </span>
      <span className={'pd-agent-badge'}>
        <StarIcon /> 4.9/5 Provider Rating
      </span>
    </Box>
  </Box>
);

export default PackageAgentCard;
