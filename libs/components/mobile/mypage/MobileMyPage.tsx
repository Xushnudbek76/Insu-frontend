import type { ChangeEvent } from 'react';
import { Box, Stack } from '@mui/material';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import AddPackage from '@/libs/components/mypage/AddPackage';
import AgentClaims from '@/libs/components/mypage/AgentClaims';
import MyClaims from '@/libs/components/mypage/MyClaims';
import MyFavorites from '@/libs/components/mypage/MyFavorites';
import MyPolicies from '@/libs/components/mypage/MyPolicies';
import MyProfile from '@/libs/components/mypage/MyProfile';
import SubmitClaimPanel from '@/libs/components/mypage/SubmitClaimPanel';
import type {
  Category,
  ClaimData,
  ClaimForm,
  ClaimStatus,
  FavoritePackage,
  PackageForm,
  PolicyData,
  ProfileForm,
} from '@/libs/components/mypage/types';
import type { MyPageNavItem } from '@/libs/components/mypage/MyPageSidebar';
import { avatarUrl } from '@/libs/components/mypage/types';

interface MobileMyPageProps {
  user: CustomJwtPayload;
  category: Category;
  navItems: MyPageNavItem[];
  t: (key: string, options?: Record<string, unknown>) => string;
  profileForm: ProfileForm;
  policies: PolicyData[];
  myClaims: ClaimData[];
  favorites: FavoritePackage[];
  favoritePage: number;
  favoriteTotalPages: number;
  favoriteLoading: boolean;
  policiesLoading: boolean;
  claimsLoading: boolean;
  policyStatus: string;
  policyPage: number;
  policyTotalPages: number;
  activePolicies: number;
  pendingClaims: number;
  isAgent: boolean;
  claimPanelOpen: boolean;
  claimForm: ClaimForm;
  claimError: string | null;
  packageForm: PackageForm;
  agentClaims: ClaimData[];
  agentClaimsLoading: boolean;
  agentClaimStatus: string;
  agentClaimText: string;
  agentClaimPage: number;
  agentClaimTotalPages: number;
  onCategoryChange: (category: Category) => void;
  onLogout: () => void;
  onProfileChange: (field: keyof ProfileForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onUploadProfileImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onUpdateProfile: () => void;
  onPolicyStatusChange: (status: string) => void;
  onOpenClaimPanel: (policyId: string) => void;
  onCancelPolicy: (policyId: string) => void;
  onPolicyPageChange: (page: number) => void;
  onPackageChange: (
    field: keyof PackageForm,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onUploadPackageImages: (event: ChangeEvent<HTMLInputElement>) => void;
  onCreatePackage: () => void;
  onFavoriteOpen: (packageId: string) => void;
  onFavoriteRefresh: () => void;
  onFavoritePageChange: (page: number) => void;
  onAgentClaimTextChange: (text: string) => void;
  onAgentClaimStatusChange: (status: string) => void;
  onUpdateClaimStatus: (claimId: string, newStatus: ClaimStatus) => void;
  onAgentClaimPageChange: (page: number) => void;
  onClaimChange: (field: keyof ClaimForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCloseClaimPanel: () => void;
  onSubmitClaim: () => void;
}

const MobileMyPage = ({
  user,
  category,
  navItems,
  t,
  profileForm,
  policies,
  myClaims,
  favorites,
  favoritePage,
  favoriteTotalPages,
  favoriteLoading,
  policiesLoading,
  claimsLoading,
  policyStatus,
  policyPage,
  policyTotalPages,
  activePolicies,
  pendingClaims,
  isAgent,
  claimPanelOpen,
  claimForm,
  claimError,
  packageForm,
  agentClaims,
  agentClaimsLoading,
  agentClaimStatus,
  agentClaimText,
  agentClaimPage,
  agentClaimTotalPages,
  onCategoryChange,
  onLogout,
  onProfileChange,
  onUploadProfileImage,
  onUpdateProfile,
  onPolicyStatusChange,
  onOpenClaimPanel,
  onCancelPolicy,
  onPolicyPageChange,
  onPackageChange,
  onUploadPackageImages,
  onCreatePackage,
  onFavoriteOpen,
  onFavoriteRefresh,
  onFavoritePageChange,
  onAgentClaimTextChange,
  onAgentClaimStatusChange,
  onUpdateClaimStatus,
  onAgentClaimPageChange,
  onClaimChange,
  onCloseClaimPanel,
  onSubmitClaim,
}: MobileMyPageProps) => (
  <Stack className='mobile-mypage-page'>
    <Stack className='mobile-mypage-summary'>
      <Box component='img' src={avatarUrl(profileForm.memberImage)} alt={user.memberNick} className='mobile-mypage-avatar' />
      <span>{user.memberType}</span>
      <h1>{user.memberNick}</h1>
      <p>{user.memberPhone || t('No phone registered')}</p>
      <Stack className='mobile-mypage-counts'>
        <div>
          <strong>{activePolicies}</strong>
          <span>{t('Active Policies')}</span>
        </div>
        <div>
          <strong>{pendingClaims}</strong>
          <span>{t('Pending Claims')}</span>
        </div>
      </Stack>
      <button className='mobile-logout-btn' onClick={onLogout}>
        {t('Logout')}
      </button>
    </Stack>

    <Box className='mobile-category-scroll'>
      {navItems.map((item) => (
        <button key={item.key} className={category === item.key ? 'active' : ''} onClick={() => onCategoryChange(item.key)}>
          {item.label}
        </button>
      ))}
    </Box>

    {category === 'myProfile' && (
      <MyProfile
        user={user}
        profileForm={profileForm}
        policies={policies}
        myClaims={myClaims}
        t={t}
        onProfileChange={onProfileChange}
        onUploadProfileImage={onUploadProfileImage}
        onUpdateProfile={onUpdateProfile}
      />
    )}

    {category === 'addPackage' && isAgent && (
      <AddPackage
        packageForm={packageForm}
        t={t}
        onPackageChange={onPackageChange}
        onUploadPackageImages={onUploadPackageImages}
        onCreatePackage={onCreatePackage}
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
        onPolicyStatusChange={onPolicyStatusChange}
        onOpenClaimPanel={onOpenClaimPanel}
        onCancelPolicy={onCancelPolicy}
        onPageChange={onPolicyPageChange}
      />
    )}

    {category === 'myClaims' && <MyClaims claims={myClaims} loading={claimsLoading} t={t} />}

    {category === 'myFavorites' && (
      <MyFavorites
        favorites={favorites}
        loading={favoriteLoading}
        page={favoritePage}
        totalPages={favoriteTotalPages}
        t={t}
        onOpenPackage={onFavoriteOpen}
        onRemoveFavorite={onFavoriteRefresh}
        onPageChange={onFavoritePageChange}
      />
    )}

    {category === 'agentClaims' && isAgent && (
      <AgentClaims
        claims={agentClaims}
        loading={agentClaimsLoading}
        claimStatus={agentClaimStatus}
        claimText={agentClaimText}
        page={agentClaimPage}
        totalPages={agentClaimTotalPages}
        t={t}
        onTextChange={onAgentClaimTextChange}
        onStatusChange={onAgentClaimStatusChange}
        onUpdateClaimStatus={onUpdateClaimStatus}
        onPageChange={onAgentClaimPageChange}
      />
    )}

    {claimPanelOpen && (
      <SubmitClaimPanel
        claimForm={claimForm}
        claimError={claimError}
        t={t}
        onClaimChange={onClaimChange}
        onClose={onCloseClaimPanel}
        onSubmitClaim={onSubmitClaim}
      />
    )}
  </Stack>
);

export default MobileMyPage;
