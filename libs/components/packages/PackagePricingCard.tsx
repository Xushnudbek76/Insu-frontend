import { Box } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { userVar } from '@/apollo/store';

interface PackagePricingCardProps {
  packageId: string;
  price: number;
  status: string;
}

const PackagePricingCard = ({
  packageId,
  price,
  status,
}: PackagePricingCardProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const handleApply = () => {
    const returnTo = `/mypage?category=messages&packageId=${encodeURIComponent(packageId)}`;
    void router.push(userVar()?._id ? returnTo : { pathname: '/account/join', query: { returnTo } });
  };

  return (
    <Box className={'pd-pricing-card'}>
      <Box className={'pd-pricing-top'}>
        <span className={'pd-pricing-label'}>{t('Monthly Premium')}</span>
        <Box className={'pd-pricing-amount'}>
          <span className={'pd-price'}>${price.toLocaleString()}</span>
          <span className={'pd-price-unit'}>{t('/mo')}</span>
        </Box>
      </Box>
      <ul className={'pd-features'}>
        <li>
          <CheckCircleOutlinedIcon /> {t('Zero Deductible Options')}
        </li>
        <li>
          <CheckCircleOutlinedIcon /> {t('24/7 Technical Support')}
        </li>
        <li>
          <CheckCircleOutlinedIcon /> {t('Direct Digital Claims')}
        </li>
      </ul>
      <button
        className={'pd-apply-btn'}
        onClick={handleApply}
        disabled={status !== 'ACTIVE'}
      >
        {t('Chat with Agent')}
      </button>
    </Box>
  );
};

export default PackagePricingCard;
