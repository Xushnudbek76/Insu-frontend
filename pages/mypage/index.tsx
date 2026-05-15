import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Box, Stack } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import EmptyIcon from '@mui/icons-material/InboxOutlined';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import withLayoutBasic from '@/layout/LayoutBasic';
import { userVar } from '@/apollo/store';
import { GET_MY_POLICIES } from '@/apollo/policy/query';
import { CANCEL_POLICY } from '@/apollo/policy/mutation';
import { GET_CLAIMS_BY_AGENT, GET_MY_CLAIMS } from '@/apollo/claim/query';
import { SUBMIT_CLAIM, UPDATE_CLAIM_STATUS } from '@/apollo/claim/mutation';
import { GET_FAVORITE_PACKAGES } from '@/apollo/favorite/query';
import { IMAGE_UPLOADER_MUTATION, IMAGES_UPLOADER_MUTATION, UPDATE_MEMBER } from '@/apollo/member/mutation';
import { CREATE_PACKAGE } from '@/apollo/package/mutation';
import { getJwtToken, logOut, setJwtToken, updateUserInfo } from '@/libs/auth';
import { toAssetUrl } from '@/libs/api';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';

const POLICY_LIMIT = 5;
const AGENT_CLAIM_LIMIT = 5;
const FAVORITE_LIMIT = 6;

type Category = 'myProfile' | 'addPackage' | 'myPolicies' | 'myClaims' | 'myFavorites' | 'agentClaims';
type PackageType =
  | 'TERM_LIFE'
  | 'WHOLE_LIFE'
  | 'PET'
  | 'CRITICAL_ILLNESS'
  | 'DISABILITY'
  | 'TRAVEL'
  | 'CYBER_LIABILITY'
  | 'PROFESSIONAL_INDEMNITY'
  | 'LEGAL_EXPENSE'
  | 'ACCIDENT'
  | 'HEALTH'
  | 'AUTO'
  | 'HOME';
type PolicyStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SETTLED';

interface PolicyData {
  _id: string;
  policyStatus: PolicyStatus;
  packageId: string;
  packageName: string;
  premiumAmount: number;
  AgentId: string;
  startDate: string;
  endDate: string;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ClaimData {
  _id: string;
  claimStatus: ClaimStatus;
  memberId: string;
  policyId: string;
  claimTitle: string;
  claimDesc: string;
  agentId: string;
  claimAmount: number;
  claimDocuments?: string[] | null;
  aiAnalysis?: string | null;
  agentNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FavoritePackage {
  _id: string;
  packageType: string;
  packageStatus: string;
  packageTitle: string;
  packagePrice: number;
  packageImages?: string[] | null;
  packageViews?: number | null;
  packageLikes?: number | null;
  packageComments?: number | null;
  packageCoverageLimit?: number | null;
  memberData?: { _id: string; memberNick?: string | null; memberImage?: string | null } | null;
}

interface ProfileForm {
  memberNick: string;
  memberFullName: string;
  memberPhone: string;
  memberAddress: string;
  memberDesc: string;
  memberImage: string;
}

interface ClaimForm {
  policyId: string;
  claimTitle: string;
  claimDesc: string;
  claimAmount: string;
  claimDocuments: string;
}

interface PackageForm {
  packageType: PackageType | '';
  packageName: string;
  packageDesc: string;
  packagePrice: string;
  packageCoverageLimit: string;
  packageMinAge: string;
  packageMaxAge: string;
  packageAssetTags: string;
  packageImages: string[];
}

const isCategory = (value: unknown): value is Category =>
  ['myProfile', 'addPackage', 'myPolicies', 'myClaims', 'myFavorites', 'agentClaims'].includes(`${value}`);

const formatCurrency = (value?: number | null) =>
  value == null
    ? '$0'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '-';

const avatarUrl = (image?: string | null) => toAssetUrl(image) ?? '/img/profile/defaultUser.svg';

const initialClaimForm: ClaimForm = {
  policyId: '',
  claimTitle: '',
  claimDesc: '',
  claimAmount: '',
  claimDocuments: '',
};

const initialPackageForm: PackageForm = {
  packageType: '',
  packageName: '',
  packageDesc: '',
  packagePrice: '',
  packageCoverageLimit: '',
  packageMinAge: '',
  packageMaxAge: '',
  packageAssetTags: '',
  packageImages: [],
};

const packageTypes: PackageType[] = [
  'AUTO',
  'HOME',
  'HEALTH',
  'TRAVEL',
  'TERM_LIFE',
  'WHOLE_LIFE',
  'PET',
  'CRITICAL_ILLNESS',
  'DISABILITY',
  'CYBER_LIABILITY',
  'PROFESSIONAL_INDEMNITY',
  'LEGAL_EXPENSE',
  'ACCIDENT',
];

const MyPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<CustomJwtPayload | null>(() => userVar());
  const [policyPage, setPolicyPage] = useState(1);
  const [policyStatus, setPolicyStatus] = useState('');
  const [favoritePage, setFavoritePage] = useState(1);
  const [agentClaimPage, setAgentClaimPage] = useState(1);
  const [agentClaimStatus, setAgentClaimStatus] = useState('');
  const [agentClaimText, setAgentClaimText] = useState('');
  const [claimPanelOpen, setClaimPanelOpen] = useState(false);
  const [claimForm, setClaimForm] = useState<ClaimForm>(initialClaimForm);
  const [packageForm, setPackageForm] = useState<PackageForm>(initialPackageForm);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    memberNick: '',
    memberFullName: '',
    memberPhone: '',
    memberAddress: '',
    memberDesc: '',
    memberImage: '',
  });

  const category = isCategory(router.query.category) ? router.query.category : 'myProfile';
  const isAgent = user?.memberType === 'AGENT';

  useEffect(() => {
    const token = getJwtToken();
    if (token && !userVar()?._id) updateUserInfo(token);
    setUser(userVar());
    setAuthReady(true);

    const dispose = userVar.onNextChange((nextUser) => setUser(nextUser));
    return () => {
      if (typeof dispose === 'function') dispose();
    };
  }, []);

  useEffect(() => {
    if (authReady && !user?._id) router.replace('/account/join');
  }, [authReady, router, user?._id]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      memberNick: user.memberNick ?? '',
      memberFullName: user.memberFullName ?? '',
      memberPhone: user.memberPhone ?? '',
      memberAddress: user.memberAddress ?? '',
      memberDesc: user.memberDesc ?? '',
      memberImage: user.memberImage ?? '',
    });
  }, [user]);

  useEffect(() => {
    if ((category === 'agentClaims' || category === 'addPackage') && authReady && user && !isAgent) {
      router.replace('/mypage?category=myProfile');
    }
  }, [authReady, category, isAgent, router, user]);

  const policyInput = useMemo(
    () => ({
      page: policyPage,
      limit: POLICY_LIMIT,
      sort: 'createdAt',
      direction: 'DESC',
      search: policyStatus ? { policyStatus } : {},
    }),
    [policyPage, policyStatus],
  );

  const agentClaimsInput = useMemo(
    () => ({
      page: agentClaimPage,
      limit: AGENT_CLAIM_LIMIT,
      sort: 'createdAt',
      direction: 'DESC',
      search: {
        ...(agentClaimStatus ? { claimStatus: agentClaimStatus } : {}),
        ...(agentClaimText.trim() ? { text: agentClaimText.trim() } : {}),
      },
    }),
    [agentClaimPage, agentClaimStatus, agentClaimText],
  );

  const {
    loading: policiesLoading,
    data: policiesData,
    refetch: refetchPolicies,
  } = useQuery<{ getMyPolicies: { list: PolicyData[]; metaCounter?: { total?: number }[] } }>(
    GET_MY_POLICIES,
    {
      skip: !user?._id,
      fetchPolicy: 'no-cache',
      variables: { input: policyInput },
    },
  );

  const {
    loading: claimsLoading,
    data: claimsData,
    refetch: refetchMyClaims,
  } = useQuery<{ getMyClaims: ClaimData[] }>(GET_MY_CLAIMS, {
    skip: !user?._id,
    fetchPolicy: 'no-cache',
  });

  const {
    loading: agentClaimsLoading,
    data: agentClaimsData,
    refetch: refetchAgentClaims,
  } = useQuery<{ getClaimsByAgent: { list: ClaimData[]; metaCounter?: { total?: number }[] } }>(
    GET_CLAIMS_BY_AGENT,
    {
      skip: !isAgent,
      fetchPolicy: 'no-cache',
      variables: { input: agentClaimsInput },
    },
  );

  const {
    loading: favoritesLoading,
    data: favoritesData,
    refetch: refetchFavorites,
  } = useQuery<{ getFavoritePackages: { list: FavoritePackage[]; metaCounter?: { total?: number }[] } }>(
    GET_FAVORITE_PACKAGES,
    {
      skip: !user?._id,
      fetchPolicy: 'no-cache',
      variables: { input: { page: favoritePage, limit: FAVORITE_LIMIT } },
    },
  );

  const [updateMember] = useMutation<{ updateMember: CustomJwtPayload & { accessToken?: string } }>(UPDATE_MEMBER);
  const [uploadImage] = useMutation<{ imageUploader: string }>(IMAGE_UPLOADER_MUTATION);
  const [uploadImages] = useMutation<{ imagesUploader: string[] }>(IMAGES_UPLOADER_MUTATION);
  const [createPackage] = useMutation<{ createPackage: { _id: string } }>(CREATE_PACKAGE);
  const [cancelPolicy] = useMutation<{ cancelPolicy: PolicyData }>(CANCEL_POLICY);
  const [submitClaim] = useMutation<{ submitClaim: ClaimData }>(SUBMIT_CLAIM);
  const [updateClaimStatus] = useMutation<{ updateClaimStatus: ClaimData }>(UPDATE_CLAIM_STATUS);

  const policies = policiesData?.getMyPolicies.list ?? [];
  const policyTotal = policiesData?.getMyPolicies.metaCounter?.[0]?.total ?? 0;
  const policyTotalPages = Math.max(1, Math.ceil(policyTotal / POLICY_LIMIT));
  const myClaims = claimsData?.getMyClaims ?? [];
  const agentClaims = agentClaimsData?.getClaimsByAgent.list ?? [];
  const agentClaimTotal = agentClaimsData?.getClaimsByAgent.metaCounter?.[0]?.total ?? 0;
  const agentClaimTotalPages = Math.max(1, Math.ceil(agentClaimTotal / AGENT_CLAIM_LIMIT));
  const favorites = favoritesData?.getFavoritePackages.list ?? [];
  const favoriteTotal = favoritesData?.getFavoritePackages.metaCounter?.[0]?.total ?? 0;
  const favoriteTotalPages = Math.max(1, Math.ceil(favoriteTotal / FAVORITE_LIMIT));
  const activePolicies = policies.filter((policy) => policy.policyStatus === 'ACTIVE').length;
  const pendingClaims = myClaims.filter((claim) => claim.claimStatus === 'PENDING').length;

  const navItems = [
    { key: 'myProfile' as Category, label: t('My Profile'), icon: AccountCircleOutlinedIcon },
    ...(isAgent ? [{ key: 'addPackage' as Category, label: t('Add Package'), icon: AddBusinessOutlinedIcon }] : []),
    { key: 'myPolicies' as Category, label: t('My Policies'), icon: AssignmentOutlinedIcon },
    { key: 'myClaims' as Category, label: t('My Claims'), icon: GavelOutlinedIcon },
    { key: 'myFavorites' as Category, label: t('My Favorites'), icon: FavoriteBorderOutlinedIcon },
    ...(isAgent ? [{ key: 'agentClaims' as Category, label: t('Agent Claims'), icon: SupportAgentOutlinedIcon }] : []),
  ];

  const changeCategory = (nextCategory: Category) => {
    router.push({ pathname: '/mypage', query: { category: nextCategory } }, undefined, { shallow: true });
  };

  const handleProfileChange =
    (field: keyof ProfileForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfileForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handlePackageChange =
    (field: keyof PackageForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setPackageForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleUploadProfileImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage({ variables: { file, target: 'member' } });
      if (result.data?.imageUploader) {
        setProfileForm((prev) => ({ ...prev, memberImage: result.data!.imageUploader }));
      }
    } catch (err: any) {
      await sweetMixinErrorAlert(err?.message ?? t('Could not upload image.'));
    }
  };

  const handleUploadPackageImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    if (files.length > 5) {
      await sweetMixinErrorAlert(t('You can upload up to 5 images.'));
      return;
    }

    try {
      const result = await uploadImages({ variables: { files, target: 'package' } });
      setPackageForm((prev) => ({ ...prev, packageImages: result.data?.imagesUploader ?? [] }));
    } catch (err: any) {
      await sweetMixinErrorAlert(err?.message ?? t('Could not upload images.'));
    }
  };

  const handleCreatePackage = async () => {
    if (!packageForm.packageType || !packageForm.packageName.trim() || !packageForm.packagePrice) {
      await sweetMixinErrorAlert(t('Please complete the package form.'));
      return;
    }

    const input = {
      packageType: packageForm.packageType,
      packageName: packageForm.packageName.trim(),
      packageDesc: packageForm.packageDesc.trim(),
      packagePrice: Number(packageForm.packagePrice),
      ...(packageForm.packageCoverageLimit ? { packageCoverageLimit: Number(packageForm.packageCoverageLimit) } : {}),
      ...(packageForm.packageMinAge ? { packageMinAge: Number(packageForm.packageMinAge) } : {}),
      ...(packageForm.packageMaxAge ? { packageMaxAge: Number(packageForm.packageMaxAge) } : {}),
      ...(packageForm.packageAssetTags.trim()
        ? {
            packageAssetTags: packageForm.packageAssetTags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          }
        : {}),
      ...(packageForm.packageImages.length ? { packageImages: packageForm.packageImages } : {}),
    };

    try {
      const result = await createPackage({ variables: { input } });
      setPackageForm(initialPackageForm);
      await sweetTopSuccessAlert(t('Package created successfully.'));
      if (result.data?.createPackage._id) await router.push(`/packages/${result.data.createPackage._id}`);
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ?? err?.message ?? t('Could not create package.'),
      );
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?._id) return;

    try {
      const result = await updateMember({
        variables: {
          input: {
            _id: user._id,
            memberNick: profileForm.memberNick,
            memberFullName: profileForm.memberFullName,
            memberPhone: profileForm.memberPhone,
            memberAddress: profileForm.memberAddress,
            memberDesc: profileForm.memberDesc,
            memberImage: profileForm.memberImage,
          },
        },
      });
      const token = result.data?.updateMember.accessToken;
      if (token) {
        setJwtToken(token);
        updateUserInfo(token);
        setUser(userVar());
      }
      await sweetTopSuccessAlert(t('Profile updated successfully.'));
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ?? err?.message ?? t('Could not update profile.'),
      );
    }
  };

  const handleCancelPolicy = async (policyId: string) => {
    try {
      await cancelPolicy({ variables: { policyId } });
      await refetchPolicies({ input: policyInput });
      await sweetTopSuccessAlert(t('Policy cancelled successfully.'));
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ?? err?.message ?? t('Could not cancel policy.'),
      );
    }
  };

  const openClaimPanel = (policyId: string) => {
    setClaimForm({ ...initialClaimForm, policyId });
    setClaimPanelOpen(true);
  };

  const handleClaimChange =
    (field: keyof ClaimForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setClaimForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmitClaim = async () => {
    if (!claimForm.policyId || !claimForm.claimTitle.trim() || !claimForm.claimDesc.trim() || !claimForm.claimAmount) {
      await sweetMixinErrorAlert(t('Please complete the claim form.'));
      return;
    }

    const docs = claimForm.claimDocuments
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await submitClaim({
        variables: {
          input: {
            policyId: claimForm.policyId,
            claimTitle: claimForm.claimTitle.trim(),
            claimDesc: claimForm.claimDesc.trim(),
            claimAmount: Number(claimForm.claimAmount),
            ...(docs.length ? { claimDocuments: docs } : {}),
          },
        },
      });
      setClaimPanelOpen(false);
      setClaimForm(initialClaimForm);
      await refetchMyClaims();
      await sweetTopSuccessAlert(t('Claim submitted successfully.'));
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ?? err?.message ?? t('Could not submit claim.'),
      );
    }
  };

  const handleUpdateClaimStatus = async (claimId: string, newStatus: ClaimStatus) => {
    try {
      await updateClaimStatus({ variables: { input: { claimId, newStatus } } });
      await refetchAgentClaims({ input: agentClaimsInput });
      await sweetTopSuccessAlert(t('Claim status updated.'));
    } catch (err: any) {
      await sweetMixinErrorAlert(
        err?.graphQLErrors?.[0]?.message?.replace('Definer: ', '') ?? err?.message ?? t('Could not update claim status.'),
      );
    }
  };

  const handleRemoveFavorite = async () => {
    await refetchFavorites({ input: { page: favoritePage, limit: FAVORITE_LIMIT } });
  };

  const renderEmpty = (title: string, text: string) => (
    <Stack className='mypage-empty'>
      <EmptyIcon />
      <h3>{title}</h3>
      <p>{text}</p>
    </Stack>
  );

  const renderPagination = (page: number, totalPages: number, onChange: (nextPage: number) => void) => {
    if (totalPages <= 1) return null;

    return (
      <Stack className='mypage-pagination'>
        <button disabled={page === 1} onClick={() => onChange(page - 1)}>
          {t('Previous')}
        </button>
        <span>{t('Page {{page}} of {{total}}', { page, total: totalPages })}</span>
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)}>
          {t('Next')}
        </button>
      </Stack>
    );
  };

  if (!authReady || !user?._id) {
    return (
      <Stack className='mypage-dashboard'>
        <Stack className='mypage-shell'>
          <Box className='mypage-loading-card'>{t('Loading your dashboard...')}</Box>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack className='mypage-dashboard'>
      <Stack className='mypage-shell'>
        <Stack className='mypage-sidebar'>
          <Box className='mypage-profile-aura' />
          <Stack className='mypage-user-card'>
            <Box component='img' src={avatarUrl(profileForm.memberImage)} alt={user.memberNick} className='mypage-avatar' />
            <span className='mypage-role-chip'>{user.memberType}</span>
            <h2>{user.memberNick}</h2>
            <p>{user.memberPhone || t('No phone registered')}</p>
            <Box className='mypage-user-stats'>
              <Stack>
                <strong>{activePolicies}</strong>
                <span>{t('Active Policies')}</span>
              </Stack>
              <Stack>
                <strong>{pendingClaims}</strong>
                <span>{t('Pending Claims')}</span>
              </Stack>
            </Box>
          </Stack>

          <Stack className='mypage-menu'>
            <span>{t('Dashboard')}</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={category === item.key ? 'active' : ''}
                  onClick={() => changeCategory(item.key)}
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </Stack>

          <button className='mypage-logout' onClick={logOut}>
            <LogoutOutlinedIcon />
            {t('Logout')}
          </button>
        </Stack>

        <Stack className='mypage-content'>
          <Stack className='mypage-hero-card'>
            <Stack>
              <span>{t('Insurance Dashboard')}</span>
              <h1>{navItems.find((item) => item.key === category)?.label ?? t('My Profile')}</h1>
              <p>{t('Manage your profile, policies, claims, and saved insurance packages in one place.')}</p>
            </Stack>
            <Box className='mypage-hero-badge'>
              <VerifiedOutlinedIcon />
              {t('Secure account area')}
            </Box>
          </Stack>

          {category === 'myProfile' && (
            <Box className='mypage-profile-grid'>
              <Stack className='mypage-panel'>
                <Stack className='mypage-panel-head'>
                  <span>{t('Profile Settings')}</span>
                  <h2>{t('Update your information')}</h2>
                </Stack>
                <Box component='form' className='mypage-form'>
                  <Stack className='mypage-upload-row'>
                    <Box component='img' src={avatarUrl(profileForm.memberImage)} alt={profileForm.memberNick} />
                    <Stack>
                      <label className='mypage-upload-btn' htmlFor='mypage-avatar-upload'>
                        <CloudUploadOutlinedIcon />
                        {t('Upload Profile Image')}
                      </label>
                      <input
                        id='mypage-avatar-upload'
                        className='mypage-file-input'
                        type='file'
                        accept='image/png,image/jpeg,image/jpg,image/webp'
                        onChange={handleUploadProfileImage}
                      />
                      <small>{t('JPG, PNG, or WEBP format recommended.')}</small>
                    </Stack>
                  </Stack>

                  <Box className='mypage-form-grid'>
                    <label>
                      <span>{t('Username')}</span>
                      <input value={profileForm.memberNick} onChange={handleProfileChange('memberNick')} />
                    </label>
                    <label>
                      <span>{t('Full Name')}</span>
                      <input value={profileForm.memberFullName} onChange={handleProfileChange('memberFullName')} />
                    </label>
                    <label>
                      <span>{t('Phone')}</span>
                      <input value={profileForm.memberPhone} onChange={handleProfileChange('memberPhone')} />
                    </label>
                    <label>
                      <span>{t('Address')}</span>
                      <input value={profileForm.memberAddress} onChange={handleProfileChange('memberAddress')} />
                    </label>
                    <label className='wide'>
                      <span>{t('About')}</span>
                      <textarea value={profileForm.memberDesc} onChange={handleProfileChange('memberDesc')} />
                    </label>
                  </Box>

                  <Stack className='mypage-actions'>
                    <button type='button' onClick={handleUpdateProfile}>
                      <EditOutlinedIcon />
                      {t('Update Profile')}
                    </button>
                  </Stack>
                </Box>
              </Stack>

              <Stack className='mypage-preview-card'>
                <Box component='img' src={avatarUrl(profileForm.memberImage)} alt={profileForm.memberNick} />
                <span>{user.memberType}</span>
                <h2>{profileForm.memberFullName || profileForm.memberNick || t('Member')}</h2>
                <p>{profileForm.memberDesc || t('Your profile description will appear here.')}</p>
                <Box className='mypage-preview-meta'>
                  <Stack>
                    <strong>{formatCurrency(policies.reduce((sum, policy) => sum + (policy.premiumAmount ?? 0), 0))}</strong>
                    <span>{t('Monthly Premiums')}</span>
                  </Stack>
                  <Stack>
                    <strong>{myClaims.length}</strong>
                    <span>{t('Claims')}</span>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}

          {category === 'addPackage' && isAgent && (
            <Box className='mypage-profile-grid'>
              <Stack className='mypage-panel'>
                <Stack className='mypage-panel-head'>
                  <span>{t('Agent Listing')}</span>
                  <h2>{t('Create insurance package')}</h2>
                </Stack>
                <Box component='form' className='mypage-form'>
                  <Stack className='mypage-upload-row'>
                    <Box
                      component='img'
                      src={toAssetUrl(packageForm.packageImages[0]) ?? '/img/placeholder-article.svg'}
                      alt={packageForm.packageName || t('Package preview')}
                    />
                    <Stack>
                      <label className='mypage-upload-btn' htmlFor='mypage-package-images'>
                        <CloudUploadOutlinedIcon />
                        {t('Upload Package Images')}
                      </label>
                      <input
                        id='mypage-package-images'
                        className='mypage-file-input'
                        type='file'
                        accept='image/png,image/jpeg,image/jpg,image/webp'
                        multiple
                        onChange={handleUploadPackageImages}
                      />
                      <small>{t('Upload up to 5 JPG, PNG, or WEBP images.')}</small>
                    </Stack>
                  </Stack>

                  <Box className='mypage-form-grid'>
                    <label>
                      <span>{t('Package Name')}</span>
                      <input value={packageForm.packageName} onChange={handlePackageChange('packageName')} />
                    </label>
                    <label>
                      <span>{t('Package Type')}</span>
                      <select value={packageForm.packageType} onChange={handlePackageChange('packageType')}>
                        <option value=''>{t('Select package type')}</option>
                        {packageTypes.map((type) => (
                          <option key={type} value={type}>
                            {t(type)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>{t('Monthly Price')}</span>
                      <input
                        type='number'
                        min='0'
                        value={packageForm.packagePrice}
                        onChange={handlePackageChange('packagePrice')}
                      />
                    </label>
                    <label>
                      <span>{t('Coverage Limit')}</span>
                      <input
                        type='number'
                        min='0'
                        value={packageForm.packageCoverageLimit}
                        onChange={handlePackageChange('packageCoverageLimit')}
                      />
                    </label>
                    <label>
                      <span>{t('Minimum Age')}</span>
                      <input
                        type='number'
                        min='0'
                        value={packageForm.packageMinAge}
                        onChange={handlePackageChange('packageMinAge')}
                      />
                    </label>
                    <label>
                      <span>{t('Maximum Age')}</span>
                      <input
                        type='number'
                        min='0'
                        value={packageForm.packageMaxAge}
                        onChange={handlePackageChange('packageMaxAge')}
                      />
                    </label>
                    <label className='wide'>
                      <span>{t('Tags')}</span>
                      <input
                        value={packageForm.packageAssetTags}
                        placeholder={t('Example: family, accident, premium')}
                        onChange={handlePackageChange('packageAssetTags')}
                      />
                    </label>
                    <label className='wide'>
                      <span>{t('Description')}</span>
                      <textarea value={packageForm.packageDesc} onChange={handlePackageChange('packageDesc')} />
                    </label>
                  </Box>

                  <Stack className='mypage-actions'>
                    <button type='button' onClick={handleCreatePackage}>
                      <AddBusinessOutlinedIcon />
                      {t('Create Package')}
                    </button>
                  </Stack>
                </Box>
              </Stack>

              <Stack className='mypage-preview-card'>
                <Box
                  component='img'
                  src={toAssetUrl(packageForm.packageImages[0]) ?? '/img/placeholder-article.svg'}
                  alt={packageForm.packageName || t('Package preview')}
                />
                <span>{packageForm.packageType ? t(packageForm.packageType) : t('New Package')}</span>
                <h2>{packageForm.packageName || t('Package preview')}</h2>
                <p>{packageForm.packageDesc || t('Your package description will appear here.')}</p>
                <Box className='mypage-preview-meta'>
                  <Stack>
                    <strong>{formatCurrency(Number(packageForm.packagePrice || 0))}</strong>
                    <span>{t('Monthly Price')}</span>
                  </Stack>
                  <Stack>
                    <strong>
                      {packageForm.packageCoverageLimit
                        ? formatCurrency(Number(packageForm.packageCoverageLimit))
                        : '$0'}
                    </strong>
                    <span>{t('Coverage Limit')}</span>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}

          {category === 'myPolicies' && (
            <Stack className='mypage-panel'>
              <Stack className='mypage-panel-head row'>
                <Stack>
                  <span>{t('My Policies')}</span>
                  <h2>{t('Your active coverage')}</h2>
                </Stack>
                <select
                  value={policyStatus}
                  onChange={(event) => {
                    setPolicyStatus(event.target.value);
                    setPolicyPage(1);
                  }}
                >
                  <option value=''>{t('All Statuses')}</option>
                  <option value='ACTIVE'>{t('ACTIVE')}</option>
                  <option value='CANCELLED'>{t('CANCELLED')}</option>
                  <option value='EXPIRED'>{t('EXPIRED')}</option>
                  <option value='PENDING'>{t('PENDING')}</option>
                </select>
              </Stack>

              {policiesLoading ? (
                <Stack className='mypage-list'>{Array.from({ length: 3 }).map((_, index) => <Box key={index} className='mypage-skeleton-row' />)}</Stack>
              ) : policies.length === 0 ? (
                renderEmpty(t('No policies yet'), t('Apply for an insurance package and your policies will appear here.'))
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
                            <button onClick={() => openClaimPanel(policy._id)}>
                              <AddTaskOutlinedIcon />
                              {t('Submit Claim')}
                            </button>
                            <button className='ghost danger' onClick={() => handleCancelPolicy(policy._id)}>
                              <CancelOutlinedIcon />
                              {t('Cancel Policy')}
                            </button>
                          </>
                        )}
                      </Stack>
                    </Stack>
                  ))}
                  {renderPagination(policyPage, policyTotalPages, setPolicyPage)}
                </Stack>
              )}
            </Stack>
          )}

          {category === 'myClaims' && (
            <Stack className='mypage-panel'>
              <Stack className='mypage-panel-head'>
                <span>{t('My Claims')}</span>
                <h2>{t('Submitted claims')}</h2>
              </Stack>
              {claimsLoading ? (
                <Stack className='mypage-list'>{Array.from({ length: 3 }).map((_, index) => <Box key={index} className='mypage-skeleton-row' />)}</Stack>
              ) : myClaims.length === 0 ? (
                renderEmpty(t('No claims yet'), t('Submit a claim from an active policy when you need support.'))
              ) : (
                <Stack className='mypage-list'>
                  {myClaims.map((claim) => (
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
          )}

          {category === 'agentClaims' && isAgent && (
            <Stack className='mypage-panel'>
              <Stack className='mypage-panel-head row'>
                <Stack>
                  <span>{t('Agent Claims')}</span>
                  <h2>{t('Claims assigned to you')}</h2>
                </Stack>
                <Stack className='mypage-filter-row'>
                  <input
                    value={agentClaimText}
                    placeholder={t('Search claims')}
                    onChange={(event) => {
                      setAgentClaimText(event.target.value);
                      setAgentClaimPage(1);
                    }}
                  />
                  <select
                    value={agentClaimStatus}
                    onChange={(event) => {
                      setAgentClaimStatus(event.target.value);
                      setAgentClaimPage(1);
                    }}
                  >
                    <option value=''>{t('All Statuses')}</option>
                    <option value='PENDING'>{t('PENDING')}</option>
                    <option value='APPROVED'>{t('APPROVED')}</option>
                    <option value='REJECTED'>{t('REJECTED')}</option>
                    <option value='SETTLED'>{t('SETTLED')}</option>
                  </select>
                </Stack>
              </Stack>

              {agentClaimsLoading ? (
                <Stack className='mypage-list'>{Array.from({ length: 3 }).map((_, index) => <Box key={index} className='mypage-skeleton-row' />)}</Stack>
              ) : agentClaims.length === 0 ? (
                renderEmpty(t('No assigned claims'), t('Claims for your packages will appear here.'))
              ) : (
                <Stack className='mypage-list'>
                  {agentClaims.map((claim) => (
                    <Stack key={claim._id} className='mypage-claim-card agent'>
                      <Box className={`mypage-status ${claim.claimStatus.toLowerCase()}`}>{t(claim.claimStatus)}</Box>
                      <Stack>
                        <h3>{claim.claimTitle}</h3>
                        <p>{claim.claimDesc}</p>
                        <Box className='mypage-card-meta'>
                          <span>{t('Amount')}: {formatCurrency(claim.claimAmount)}</span>
                          <span>{t('Policy ID')}: {claim.policyId}</span>
                          <span>{formatDate(claim.createdAt)}</span>
                        </Box>
                        {claim.aiAnalysis && <strong>{t('AI Analysis')}: {claim.aiAnalysis}</strong>}
                      </Stack>
                      <Stack className='mypage-card-actions'>
                        {(['APPROVED', 'REJECTED', 'SETTLED'] as ClaimStatus[]).map((status) => (
                          <button key={status} className='ghost' onClick={() => handleUpdateClaimStatus(claim._id, status)}>
                            {t(status)}
                          </button>
                        ))}
                      </Stack>
                    </Stack>
                  ))}
                  {renderPagination(agentClaimPage, agentClaimTotalPages, setAgentClaimPage)}
                </Stack>
              )}
            </Stack>
          )}

          {category === 'myFavorites' && (
            <Stack className='mypage-panel'>
              <Stack className='mypage-panel-head'>
                <span>{t('My Favorites')}</span>
                <h2>{t('Saved insurance packages')}</h2>
              </Stack>
              {favoritesLoading ? (
                <Box className='mypage-favorites-grid'>{Array.from({ length: 3 }).map((_, index) => <Box key={index} className='mypage-skeleton-card' />)}</Box>
              ) : favorites.length === 0 ? (
                renderEmpty(t('No favorites yet'), t('Like packages to save them here for later comparison.'))
              ) : (
                <>
                  <Box className='mypage-favorites-grid'>
                    {favorites.map((pkg) => (
                      <Stack key={pkg._id} className='mypage-favorite-card' onClick={() => router.push(`/packages/${pkg._id}`)}>
                        <Box component='img' src={toAssetUrl(pkg.packageImages?.[0]) ?? '/img/placeholder-article.svg'} alt={pkg.packageTitle} />
                        <Stack>
                          <span>{pkg.packageType}</span>
                          <h3>{pkg.packageTitle}</h3>
                          <p>{formatCurrency(pkg.packagePrice)} / {t('month')}</p>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveFavorite();
                            }}
                          >
                            <ReceiptLongOutlinedIcon />
                            {t('View saved plan')}
                          </button>
                        </Stack>
                      </Stack>
                    ))}
                  </Box>
                  {renderPagination(favoritePage, favoriteTotalPages, setFavoritePage)}
                </>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>

      {claimPanelOpen && (
        <Box className='mypage-claim-overlay'>
          <Stack className='mypage-claim-modal'>
            <Stack className='mypage-panel-head'>
              <span>{t('Submit Claim')}</span>
              <h2>{t('Tell us what happened')}</h2>
            </Stack>
            <Box component='form' className='mypage-form'>
              <label>
                <span>{t('Claim Title')}</span>
                <input value={claimForm.claimTitle} onChange={handleClaimChange('claimTitle')} />
              </label>
              <label>
                <span>{t('Claim Amount')}</span>
                <input type='number' min='0' value={claimForm.claimAmount} onChange={handleClaimChange('claimAmount')} />
              </label>
              <label>
                <span>{t('Description')}</span>
                <textarea value={claimForm.claimDesc} onChange={handleClaimChange('claimDesc')} />
              </label>
              <label>
                <span>{t('Document URLs')}</span>
                <textarea
                  value={claimForm.claimDocuments}
                  placeholder={t('Optional: one document URL per line')}
                  onChange={handleClaimChange('claimDocuments')}
                />
              </label>
              <Stack className='mypage-actions split'>
                <button type='button' className='ghost' onClick={() => setClaimPanelOpen(false)}>
                  {t('Close')}
                </button>
                <button type='button' onClick={handleSubmitClaim}>
                  <ShieldOutlinedIcon />
                  {t('Submit Claim')}
                </button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export const getStaticProps = async ({ locale = 'en' }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default withLayoutBasic(MyPage);
