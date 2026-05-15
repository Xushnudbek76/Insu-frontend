import { Box } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/router';
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
  const [purchasePolicy, { loading: applying }] = useMutation<{
    purchasePolicy: PurchasedPolicy;
  }>(PURCHASE_POLICY);

  const handleApply = async () => {
    const user = userVar();
    if (!user?._id) {
      await sweetMixinErrorAlert('Please login to apply for this package.');
      router.push('/account/join');
      return;
    }

    try {
      const res = await purchasePolicy({
        variables: { input: { packageId } },
      });
      if (res.data?.purchasePolicy) {
        await sweetTopSuccessAlert('Application submitted successfully!');
      }
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ??
          err?.message ??
          'Could not submit your application.'
      );
    }
  };

  return (
    <Box className={'pd-pricing-card'}>
      <Box className={'pd-pricing-top'}>
        <span className={'pd-pricing-label'}>Monthly Premium</span>
        <Box className={'pd-pricing-amount'}>
          <span className={'pd-price'}>${price.toLocaleString()}</span>
          <span className={'pd-price-unit'}>/mo</span>
        </Box>
      </Box>
      <ul className={'pd-features'}>
        <li>
          <CheckCircleOutlinedIcon /> Zero Deductible Options
        </li>
        <li>
          <CheckCircleOutlinedIcon /> 24/7 Technical Support
        </li>
        <li>
          <CheckCircleOutlinedIcon /> Direct Digital Claims
        </li>
      </ul>
      <button
        className={'pd-apply-btn'}
        onClick={handleApply}
        disabled={applying || status !== 'ACTIVE'}
      >
        {applying ? 'Applying...' : 'Apply Now'}
      </button>
    </Box>
  );
};

export default PackagePricingCard;
