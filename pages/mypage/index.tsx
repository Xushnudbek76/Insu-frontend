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
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
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
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import AddPackage from '@/libs/components/mypage/AddPackage';
import AgentClaims from '@/libs/components/mypage/AgentClaims';
import MyClaims from '@/libs/components/mypage/MyClaims';
import MyFavorites from '@/libs/components/mypage/MyFavorites';
import MyPageSidebar, { MyPageNavItem } from '@/libs/components/mypage/MyPageSidebar';
import MyPolicies from '@/libs/components/mypage/MyPolicies';
import MyProfile from '@/libs/components/mypage/MyProfile';
import SubmitClaimPanel from '@/libs/components/mypage/SubmitClaimPanel';
import {
  AGENT_CLAIM_LIMIT,
  Category,
  ClaimData,
  ClaimForm,
  ClaimStatus,
  FAVORITE_LIMIT,
  FavoritePackage,
  initialClaimForm,
  initialPackageForm,
  isCategory,
  PackageForm,
  POLICY_LIMIT,
  PolicyData,
  ProfileForm,
} from '@/libs/components/mypage/types';

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
  const isAdmin = user?.memberType === 'ADMIN';

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

  const navItems: MyPageNavItem[] = [
    { key: 'myProfile', label: t('My Profile'), icon: AccountCircleOutlinedIcon },
    ...(isAgent ? [{ key: 'addPackage' as Category, label: t('Add Package'), icon: AddBusinessOutlinedIcon }] : []),
    { key: 'myPolicies', label: t('My Policies'), icon: AssignmentOutlinedIcon },
    { key: 'myClaims', label: t('My Claims'), icon: GavelOutlinedIcon },
    { key: 'myFavorites', label: t('My Favorites'), icon: FavoriteBorderOutlinedIcon },
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
      if (result.data?.imageUploader) setProfileForm((prev) => ({ ...prev, memberImage: result.data!.imageUploader }));
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
        <MyPageSidebar
          user={user}
          profileForm={profileForm}
          isAdmin={isAdmin}
          activePolicies={activePolicies}
          pendingClaims={pendingClaims}
          navItems={navItems}
          category={category}
          t={t}
          onAdminClick={() => router.push('/_admin/users')}
          onCategoryChange={changeCategory}
          onLogout={logOut}
        />

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
            <MyProfile
              user={user}
              profileForm={profileForm}
              policies={policies}
              myClaims={myClaims}
              t={t}
              onProfileChange={handleProfileChange}
              onUploadProfileImage={handleUploadProfileImage}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {category === 'addPackage' && isAgent && (
            <AddPackage
              packageForm={packageForm}
              t={t}
              onPackageChange={handlePackageChange}
              onUploadPackageImages={handleUploadPackageImages}
              onCreatePackage={handleCreatePackage}
            />
          )}

          {category === 'myPolicies' && (
            <MyPolicies
              policies={policies}
              loading={policiesLoading}
              policyStatus={policyStatus}
              policyPage={policyPage}
              policyTotalPages={policyTotalPages}
              t={t}
              onPolicyStatusChange={(nextStatus) => {
                setPolicyStatus(nextStatus);
                setPolicyPage(1);
              }}
              onOpenClaimPanel={openClaimPanel}
              onCancelPolicy={handleCancelPolicy}
              onPageChange={setPolicyPage}
            />
          )}

          {category === 'myClaims' && <MyClaims claims={myClaims} loading={claimsLoading} t={t} />}

          {category === 'agentClaims' && isAgent && (
            <AgentClaims
              claims={agentClaims}
              loading={agentClaimsLoading}
              claimStatus={agentClaimStatus}
              claimText={agentClaimText}
              page={agentClaimPage}
              totalPages={agentClaimTotalPages}
              t={t}
              onTextChange={(text) => {
                setAgentClaimText(text);
                setAgentClaimPage(1);
              }}
              onStatusChange={(nextStatus) => {
                setAgentClaimStatus(nextStatus);
                setAgentClaimPage(1);
              }}
              onUpdateClaimStatus={handleUpdateClaimStatus}
              onPageChange={setAgentClaimPage}
            />
          )}

          {category === 'myFavorites' && (
            <MyFavorites
              favorites={favorites}
              loading={favoritesLoading}
              page={favoritePage}
              totalPages={favoriteTotalPages}
              t={t}
              onOpenPackage={(packageId) => router.push(`/packages/${packageId}`)}
              onRemoveFavorite={handleRemoveFavorite}
              onPageChange={setFavoritePage}
            />
          )}
        </Stack>
      </Stack>

      {claimPanelOpen && (
        <SubmitClaimPanel
          claimForm={claimForm}
          t={t}
          onClaimChange={handleClaimChange}
          onClose={() => setClaimPanelOpen(false)}
          onSubmitClaim={handleSubmitClaim}
        />
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
