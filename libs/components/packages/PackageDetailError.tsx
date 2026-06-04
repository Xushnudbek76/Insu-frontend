import { Box } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useTranslation } from 'next-i18next/pages';

interface PackageDetailErrorProps {
  message: string;
  onBack: () => void;
}

const PackageDetailError = ({ message, onBack }: PackageDetailErrorProps) => {
  const { t } = useTranslation('common');

  return (
    <Box className={'pd-page'}>
      <Box className={'pd-error'}>
        <ShieldOutlinedIcon />
        <p>{message}</p>
        <button onClick={onBack}>{t('Go Back')}</button>
      </Box>
    </Box>
  );
};

export default PackageDetailError;
