import { Box } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { userVar } from '@/apollo/store';
import { PURCHASE_POLICY } from '@/apollo/policy/mutation';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
import type { PurchasedPolicy } from './types';

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
  const [purchasePolicy, { loading: applying }] = useMutation<{
    purchasePolicy: PurchasedPolicy;
  }>(PURCHASE_POLICY);

  const handleApply = async () => {
    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert(t('Please login to apply for this package.'));
      router.push('/account/join');
      return;
    }

    try {
      const res = await purchasePolicy({
        variables: { input: { packageId } },
      });
      if (res.data?.purchasePolicy) {
        await sweetTopSuccessAlert(t('Application submitted successfully!'));
      }
    } catch (err: any) {
      await sweetMixinErrorAlert(
          err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ??
          err?.message ??
          t('Could not submit your application.')
      );
    }
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
        disabled={applying || status !== 'ACTIVE'}
      >
        {applying ? t('Applying...') : t('Apply Now')}
      </button>
    </Box>
  );
};

export default PackagePricingCard;
