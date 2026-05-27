import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client/react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useTranslation } from 'next-i18next/pages';
import { userVar } from '@/apollo/store';
import { GET_MY_POLICIES } from '@/apollo/policy/query';
import { CANCEL_POLICY } from '@/apollo/policy/mutation';
import { GET_CLAIMS_BY_AGENT, GET_MY_CLAIMS } from '@/apollo/claim/query';
import { SUBMIT_CLAIM, UPDATE_CLAIM_STATUS } from '@/apollo/claim/mutation';
import { GET_FAVORITE_PACKAGES } from '@/apollo/favorite/query';
import { IMAGE_UPLOADER_MUTATION, IMAGES_UPLOADER_MUTATION, UPDATE_MEMBER } from '@/apollo/member/mutation';
import { CREATE_PACKAGE, UPDATE_PACKAGE } from '@/apollo/package/mutation';
import { GET_AGENT_PACKAGES } from '@/apollo/package/query';
import { getJwtToken, logOut, setJwtToken, updateUserInfo } from '@/libs/auth';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '@/libs/sweetAlert';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import { getMyPageErrorMessage } from '@/libs/components/mypage/error';
import type { MyPageNavItem } from '@/libs/components/mypage/MyPageSidebar';
import {
  AGENT_PACKAGE_LIMIT,
  AgentOwnedPackage,
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

type MyPageTranslationFn = (key: string, options?: Record<string, unknown>) => string;

export interface MyPageControllerResult {
  t: MyPageTranslationFn;
  access: {
    authReady: boolean;
    user: CustomJwtPayload | null;
    isAgent: boolean;
    isAdmin: boolean;
    category: Category;
  };
  profile: {
    form: ProfileForm;
    onChange: (field: keyof ProfileForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onUploadImage: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
    onSubmit: () => Promise<void>;
  };
  policies: {
    items: PolicyData[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    status: string;
    onStatusChange: (status: string) => void;
    onPageChange: (page: number) => void;
    onOpenClaimPanel: (policyId: string) => void;
    onCancel: (policyId: string) => Promise<void>;
  };
  claims: {
    items: ClaimData[];
    loading: boolean;
    error: string | null;
  };
  agentClaims: {
    items: ClaimData[];
    loading: boolean;
    error: string | null;
    status: string;
    text: string;
    page: number;
    totalPages: number;
    onStatusChange: (status: string) => void;
    onTextChange: (text: string) => void;
    onPageChange: (page: number) => void;
    onUpdateStatus: (claimId: string, newStatus: ClaimStatus) => Promise<void>;
  };
  favorites: {
    items: FavoritePackage[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onOpenPackage: (packageId: string) => Promise<boolean>;
    onRefresh: () => Promise<void>;
  };
  packageCreation: {
    form: PackageForm;
    isEditing: boolean;
    onChange: (
      field: keyof PackageForm,
    ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onUploadImages: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
    onSubmit: () => Promise<void>;
    onCancelEdit: () => void;
  };
  agentPackages: {
    items: AgentOwnedPackage[];
    loading: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    status: string;
    onStatusChange: (status: string) => void;
    onPageChange: (page: number) => void;
    onEdit: (pkg: AgentOwnedPackage) => void;
    onUpdateStatus: (packageId: string, nextStatus: string) => Promise<void>;
  };
  claimPanel: {
    open: boolean;
    form: ClaimForm;
    error: string | null;
    onChange: (field: keyof ClaimForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onOpen: (policyId: string) => void;
    onClose: () => void;
    onSubmit: () => Promise<void>;
  };
  summary: {
    navItems: MyPageNavItem[];
    activePolicies: number;
    pendingClaims: number;
  };
  navigation: {
    onCategoryChange: (category: Category) => void;
    onLogout: () => void;
    onAdminClick: () => Promise<boolean>;
  };
}

export const useMyPageController = (): MyPageControllerResult => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<CustomJwtPayload | null>(() => userVar());
  const [policyPage, setPolicyPage] = useState(1);
  const [policyStatus, setPolicyStatus] = useState('');
  const [favoritePage, setFavoritePage] = useState(1);
  const [agentPackagePage, setAgentPackagePage] = useState(1);
  const [agentPackageStatus, setAgentPackageStatus] = useState('');
  const [agentClaimPage, setAgentClaimPage] = useState(1);
  const [agentClaimStatus, setAgentClaimStatus] = useState('');
  const [agentClaimText, setAgentClaimText] = useState('');
  const [claimPanelOpen, setClaimPanelOpen] = useState(false);
  const [claimForm, setClaimForm] = useState<ClaimForm>(initialClaimForm);
  const [claimError, setClaimError] = useState<string | null>(null);
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
    if ((category === 'agentClaims' || category === 'addPackage' || category === 'myPackages') && authReady && user && !isAgent) {
      router.replace('/mypage?category=myProfile');
    }
  }, [authReady, category, isAgent, router, user]);

  const agentPackagesInput = useMemo(
    () => ({
      page: agentPackagePage,
      limit: AGENT_PACKAGE_LIMIT,
      sort: 'createdAt',
      direction: 'DESC',
      search: agentPackageStatus ? { packageStatus: agentPackageStatus } : {},
    }),
    [agentPackagePage, agentPackageStatus],
  );

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
    error: policiesError,
    refetch: refetchPolicies,
  } = useQuery<{ getMyPolicies: { list: PolicyData[]; metaCounter?: { total?: number }[] } }>(
    GET_MY_POLICIES,
    {
      skip: !user?._id,
      fetchPolicy: 'cache-and-network',
      variables: { input: policyInput },
    },
  );

  const {
    loading: claimsLoading,
    data: claimsData,
    error: claimsError,
    refetch: refetchMyClaims,
  } = useQuery<{ getMyClaims: ClaimData[] }>(GET_MY_CLAIMS, {
    skip: !user?._id,
    fetchPolicy: 'no-cache',
  });

  const {
    loading: agentClaimsLoading,
    data: agentClaimsData,
    error: agentClaimsError,
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
    loading: agentPackagesLoading,
    data: agentPackagesData,
    error: agentPackagesError,
    refetch: refetchAgentPackages,
  } = useQuery<{ getAgentPackages: { list: AgentOwnedPackage[]; metaCounter?: { total?: number }[] } }>(
    GET_AGENT_PACKAGES,
    {
      skip: !isAgent,
      fetchPolicy: 'no-cache',
      variables: { input: agentPackagesInput },
    },
  );

  const {
    loading: favoritesLoading,
    data: favoritesData,
    error: favoritesError,
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
  const [updatePackage] = useMutation<{ updatePackage: { _id: string } }>(UPDATE_PACKAGE);
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
  const agentPackages = agentPackagesData?.getAgentPackages.list ?? [];
  const agentPackageTotal = agentPackagesData?.getAgentPackages.metaCounter?.[0]?.total ?? 0;
  const agentPackageTotalPages = Math.max(1, Math.ceil(agentPackageTotal / AGENT_PACKAGE_LIMIT));
  const favorites = favoritesData?.getFavoritePackages.list ?? [];
  const favoriteTotal = favoritesData?.getFavoritePackages.metaCounter?.[0]?.total ?? 0;
  const favoriteTotalPages = Math.max(1, Math.ceil(favoriteTotal / FAVORITE_LIMIT));
  const activePolicies = policies.filter((policy) => policy.policyStatus === 'ACTIVE').length;
  const pendingClaims = myClaims.filter((claim) => claim.claimStatus === 'PENDING').length;

  const policyErrorMessage = policiesError ? getMyPageErrorMessage(policiesError, t('Could not load policies.')) : null;
  const claimsErrorMessage = claimsError ? getMyPageErrorMessage(claimsError, t('Could not load claims.')) : null;
  const agentClaimsErrorMessage = agentClaimsError
    ? getMyPageErrorMessage(agentClaimsError, t('Could not load agent claims.'))
    : null;
  const agentPackagesErrorMessage = agentPackagesError
    ? getMyPageErrorMessage(agentPackagesError, t('Could not load packages.'))
    : null;
  const favoritesErrorMessage = favoritesError
    ? getMyPageErrorMessage(favoritesError, t('Could not load favorites.'))
    : null;

  const navItems: MyPageNavItem[] = [
    { key: 'myProfile', label: t('My Profile'), icon: AccountCircleOutlinedIcon },
    ...(isAgent ? [{ key: 'myPackages' as Category, label: t('My Packages'), icon: Inventory2OutlinedIcon }] : []),
    ...(isAgent ? [{ key: 'addPackage' as Category, label: t('Add Package'), icon: AddBusinessOutlinedIcon }] : []),
    { key: 'myPolicies', label: t('My Policies'), icon: AssignmentOutlinedIcon },
    { key: 'myClaims', label: t('My Claims'), icon: GavelOutlinedIcon },
    { key: 'myFavorites', label: t('My Favorites'), icon: FavoriteBorderOutlinedIcon },
    ...(isAgent ? [{ key: 'agentClaims' as Category, label: t('Agent Claims'), icon: SupportAgentOutlinedIcon }] : []),
  ];

  const handleCategoryChange = (nextCategory: Category) => {
    if (nextCategory === 'addPackage') {
      setPackageForm(initialPackageForm);
    }
    router.push({ pathname: '/mypage', query: { category: nextCategory } }, undefined, { shallow: true });
  };

  const handlePolicyStatusChange = (nextStatus: string) => {
    setPolicyStatus(nextStatus);
    setPolicyPage(1);
  };

  const handleAgentClaimTextChange = (text: string) => {
    setAgentClaimText(text);
    setAgentClaimPage(1);
  };

  const handleAgentClaimStatusChange = (nextStatus: string) => {
    setAgentClaimStatus(nextStatus);
    setAgentClaimPage(1);
  };

  const handleAgentPackageStatusChange = (nextStatus: string) => {
    setAgentPackageStatus(nextStatus);
    setAgentPackagePage(1);
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
      if (result.data?.imageUploader) setProfileForm((prev) => ({ ...prev, memberImage: result.data.imageUploader }));
    } catch (err: unknown) {
      await sweetMixinErrorAlert(getMyPageErrorMessage(err, t('Could not upload image.')));
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
    } catch (err: unknown) {
      await sweetMixinErrorAlert(getMyPageErrorMessage(err, t('Could not upload images.')));
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
    } catch (err: unknown) {
      await sweetMixinErrorAlert(getMyPageErrorMessage(err, t('Could not create package.')));
    }
  };

  const handleEditPackage = (pkg: AgentOwnedPackage) => {
    setPackageForm({
      _id: pkg._id,
      packageType: pkg.packageType as PackageForm['packageType'],
      packageName: pkg.packageTitle,
      packageDesc: pkg.packageDesc ?? '',
      packagePrice: String(pkg.packagePrice ?? ''),
      packageCoverageLimit: pkg.packageCoverageLimit != null ? String(pkg.packageCoverageLimit) : '',
      packageMinAge: pkg.packageMinAge != null ? String(pkg.packageMinAge) : '',
      packageMaxAge: pkg.packageMaxAge != null ? String(pkg.packageMaxAge) : '',
      packageAssetTags: pkg.packageAssetTags?.join(', ') ?? '',
      packageImages: pkg.packageImages ?? [],
    });
    router.push({ pathname: '/mypage', query: { category: 'addPackage' } }, undefined, { shallow: true });
  };

  const handleCancelPackageEdit = () => {
    setPackageForm(initialPackageForm);
  };

  const handleUpdatePackage = async () => {
    if (!packageForm._id || !packageForm.packageType || !packageForm.packageName.trim() || !packageForm.packagePrice) {
      await sweetMixinErrorAlert(t('Please complete the package form.'));
      return;
    }

    const input = {
      _id: packageForm._id,
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
        : { packageAssetTags: [] }),
      ...(packageForm.packageImages.length ? { packageImages: packageForm.packageImages } : {}),
    };

    try {
      const result = await updatePackage({ variables: { input } });
      setPackageForm(initialPackageForm);
      await refetchAgentPackages({ input: agentPackagesInput });
      await sweetTopSuccessAlert(t('Package updated successfully.'));
      if (result.data?.updatePackage._id) {
        await router.push({ pathname: '/mypage', query: { category: 'myPackages' } }, undefined, { shallow: true });
      }
    } catch (err: unknown) {
      await sweetMixinErrorAlert(getMyPageErrorMessage(err, t('Could not update package.')));
    }
  };

  const handleAgentPackageStatusUpdate = async (packageId: string, nextStatus: string) => {
    try {
      await updatePackage({ variables: { input: { _id: packageId, packageStatus: nextStatus } } });
      await refetchAgentPackages({ input: agentPackagesInput });
      await sweetTopSuccessAlert(t('Package status updated.'));
    } catch (err: unknown) {
      await sweetMixinErrorAlert(getMyPageErrorMessage(err, t('Could not update package.')));
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
    } catch (err: unknown) {
      await sweetMixinErrorAlert(getMyPageErrorMessage(err, t('Could not update profile.')));
    }
  };

  const handleCancelPolicy = async (policyId: string) => {
    try {
      await cancelPolicy({ variables: { policyId } });
      await refetchPolicies({ input: policyInput });
      await sweetTopSuccessAlert(t('Policy cancelled successfully.'));
    } catch (err: unknown) {
      await sweetMixinErrorAlert(getMyPageErrorMessage(err, t('Could not cancel policy.')));
    }
  };

  const handleOpenClaimPanel = (policyId: string) => {
    setClaimForm({ ...initialClaimForm, policyId });
    setClaimError(null);
    setClaimPanelOpen(true);
  };

  const handleClaimChange =
    (field: keyof ClaimForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setClaimError(null);
      setClaimForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmitClaim = async () => {
    if (!claimForm.policyId || !claimForm.claimTitle.trim() || !claimForm.claimDesc.trim() || !claimForm.claimAmount) {
      setClaimError(t('Please complete the claim form.'));
      return;
    }

    const docs = claimForm.claimDocuments
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      setClaimError(null);
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
      setClaimError(null);
      await refetchMyClaims();
      await sweetTopSuccessAlert(t('Claim submitted successfully.'));
    } catch (err: unknown) {
      setClaimError(getMyPageErrorMessage(err, t('Could not submit claim.')));
    }
  };

  const handleUpdateClaimStatus = async (claimId: string, newStatus: ClaimStatus) => {
    try {
      await updateClaimStatus({ variables: { input: { claimId, newStatus } } });
      await refetchAgentClaims({ input: agentClaimsInput });
      await sweetTopSuccessAlert(t('Claim status updated.'));
    } catch (err: unknown) {
      await sweetMixinErrorAlert(getMyPageErrorMessage(err, t('Could not update claim status.')));
    }
  };

  const handleFavoritesRefresh = async () => {
    await refetchFavorites({ input: { page: favoritePage, limit: FAVORITE_LIMIT } });
  };

  const handleOpenPackage = (packageId: string) => router.push(`/packages/${packageId}`);
  const handleAdminClick = () => router.push('/_admin/users');

  return {
    t,
    access: {
      authReady,
      user,
      isAgent,
      isAdmin,
      category,
    },
    profile: {
      form: profileForm,
      onChange: handleProfileChange,
      onUploadImage: handleUploadProfileImage,
      onSubmit: handleUpdateProfile,
    },
    policies: {
      items: policies,
      loading: policiesLoading,
      error: policyErrorMessage,
      page: policyPage,
      totalPages: policyTotalPages,
      status: policyStatus,
      onStatusChange: handlePolicyStatusChange,
      onPageChange: setPolicyPage,
      onOpenClaimPanel: handleOpenClaimPanel,
      onCancel: handleCancelPolicy,
    },
    claims: {
      items: myClaims,
      loading: claimsLoading,
      error: claimsErrorMessage,
    },
    agentClaims: {
      items: agentClaims,
      loading: agentClaimsLoading,
      error: agentClaimsErrorMessage,
      status: agentClaimStatus,
      text: agentClaimText,
      page: agentClaimPage,
      totalPages: agentClaimTotalPages,
      onStatusChange: handleAgentClaimStatusChange,
      onTextChange: handleAgentClaimTextChange,
      onPageChange: setAgentClaimPage,
      onUpdateStatus: handleUpdateClaimStatus,
    },
    favorites: {
      items: favorites,
      loading: favoritesLoading,
      error: favoritesErrorMessage,
      page: favoritePage,
      totalPages: favoriteTotalPages,
      onPageChange: setFavoritePage,
      onOpenPackage: handleOpenPackage,
      onRefresh: handleFavoritesRefresh,
    },
    packageCreation: {
      form: packageForm,
      isEditing: Boolean(packageForm._id),
      onChange: handlePackageChange,
      onUploadImages: handleUploadPackageImages,
      onSubmit: packageForm._id ? handleUpdatePackage : handleCreatePackage,
      onCancelEdit: handleCancelPackageEdit,
    },
    agentPackages: {
      items: agentPackages,
      loading: agentPackagesLoading,
      error: agentPackagesErrorMessage,
      page: agentPackagePage,
      totalPages: agentPackageTotalPages,
      status: agentPackageStatus,
      onStatusChange: handleAgentPackageStatusChange,
      onPageChange: setAgentPackagePage,
      onEdit: handleEditPackage,
      onUpdateStatus: handleAgentPackageStatusUpdate,
    },
    claimPanel: {
      open: claimPanelOpen,
      form: claimForm,
      error: claimError,
      onChange: handleClaimChange,
      onOpen: handleOpenClaimPanel,
      onClose: () => setClaimPanelOpen(false),
      onSubmit: handleSubmitClaim,
    },
    summary: {
      navItems,
      activePolicies,
      pendingClaims,
    },
    navigation: {
      onCategoryChange: handleCategoryChange,
      onLogout: logOut,
      onAdminClick: handleAdminClick,
    },
  };
};
