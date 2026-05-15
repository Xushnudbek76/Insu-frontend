import { Box } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

interface PackageDetailErrorProps {
  message: string;
  onBack: () => void;
}

const PackageDetailError = ({ message, onBack }: PackageDetailErrorProps) => (
  <Box className={'pd-page'}>
    <Box className={'pd-error'}>
      <ShieldOutlinedIcon />
      <p>{message}</p>
      <button onClick={onBack}>Go Back</button>
    </Box>
  </Box>
);

export default PackageDetailError;
