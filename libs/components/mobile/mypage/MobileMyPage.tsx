import { Box, Stack } from '@mui/material';
import AddPackage from '@/libs/components/mypage/AddPackage';
import AgentClaims from '@/libs/components/mypage/AgentClaims';
import MyClaims from '@/libs/components/mypage/MyClaims';
import MyFavorites from '@/libs/components/mypage/MyFavorites';
import MyPolicies from '@/libs/components/mypage/MyPolicies';
import MyProfile from '@/libs/components/mypage/MyProfile';
import SubmitClaimPanel from '@/libs/components/mypage/SubmitClaimPanel';
import type { MyPageControllerResult } from '@/libs/components/mypage/useMyPageController';
import { avatarUrl } from '@/libs/components/mypage/types';

interface MobileMyPageProps {
  t: MyPageControllerResult['t'];
  access: MyPageControllerResult['access'];
  profile: MyPageControllerResult['profile'];
  policies: MyPageControllerResult['policies'];
  claims: MyPageControllerResult['claims'];
  agentClaims: MyPageControllerResult['agentClaims'];
  favorites: MyPageControllerResult['favorites'];
  packageCreation: MyPageControllerResult['packageCreation'];
  claimPanel: MyPageControllerResult['claimPanel'];
  summary: MyPageControllerResult['summary'];
  navigation: MyPageControllerResult['navigation'];
}

const MobileMyPage = ({
  t,
  access,
  profile,
  policies,
  claims,
  agentClaims,
  favorites,
  packageCreation,
  claimPanel,
  summary,
  navigation,
}: MobileMyPageProps) => (
  <Stack className='mobile-mypage-page'>
    <Stack className='mobile-mypage-summary'>
      <Box component='img' src={avatarUrl(profile.form.memberImage)} alt={access.user?.memberNick} className='mobile-mypage-avatar' />
      <span>{access.user?.memberType}</span>
      <h1>{access.user?.memberNick}</h1>
      <p>{access.user?.memberPhone || t('No phone registered')}</p>
      <Stack className='mobile-mypage-counts'>
        <div>
          <strong>{summary.activePolicies}</strong>
          <span>{t('Active Policies')}</span>
        </div>
        <div>
          <strong>{summary.pendingClaims}</strong>
          <span>{t('Pending Claims')}</span>
        </div>
      </Stack>
      <button className='mobile-logout-btn' onClick={navigation.onLogout}>
        {t('Logout')}
      </button>
    </Stack>

    <Box className='mobile-category-scroll'>
      {summary.navItems.map((item) => (
        <button
          key={item.key}
          className={access.category === item.key ? 'active' : ''}
          onClick={() => navigation.onCategoryChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </Box>

    {access.category === 'myProfile' && access.user && (
      <MyProfile
        user={access.user}
        profileForm={profile.form}
        policies={policies.items}
        myClaims={claims.items}
        t={t}
        onProfileChange={profile.onChange}
        onUploadProfileImage={profile.onUploadImage}
        onUpdateProfile={profile.onSubmit}
      />
    )}

    {access.category === 'addPackage' && access.isAgent && (
      <AddPackage
        packageForm={packageCreation.form}
        t={t}
        onPackageChange={packageCreation.onChange}
        onUploadPackageImages={packageCreation.onUploadImages}
        onCreatePackage={packageCreation.onSubmit}
      />
    )}

    {access.category === 'myPolicies' && (
      <MyPolicies
        policies={policies.items}
        loading={policies.loading}
        error={policies.error}
        policyStatus={policies.status}
        policyPage={policies.page}
        policyTotalPages={policies.totalPages}
        t={t}
        onPolicyStatusChange={policies.onStatusChange}
        onOpenClaimPanel={policies.onOpenClaimPanel}
        onCancelPolicy={policies.onCancel}
        onPageChange={policies.onPageChange}
      />
    )}

    {access.category === 'myClaims' && <MyClaims claims={claims.items} loading={claims.loading} error={claims.error} t={t} />}

    {access.category === 'myFavorites' && (
      <MyFavorites
        favorites={favorites.items}
        loading={favorites.loading}
        error={favorites.error}
        page={favorites.page}
        totalPages={favorites.totalPages}
        t={t}
        onOpenPackage={favorites.onOpenPackage}
        onRemoveFavorite={favorites.onRefresh}
        onPageChange={favorites.onPageChange}
      />
    )}

    {access.category === 'agentClaims' && access.isAgent && (
      <AgentClaims
        claims={agentClaims.items}
        loading={agentClaims.loading}
        error={agentClaims.error}
        claimStatus={agentClaims.status}
        claimText={agentClaims.text}
        page={agentClaims.page}
        totalPages={agentClaims.totalPages}
        t={t}
        onTextChange={agentClaims.onTextChange}
        onStatusChange={agentClaims.onStatusChange}
        onUpdateClaimStatus={agentClaims.onUpdateStatus}
        onPageChange={agentClaims.onPageChange}
      />
    )}

    {claimPanel.open && (
      <SubmitClaimPanel
        claimForm={claimPanel.form}
        claimError={claimPanel.error}
        t={t}
        onClaimChange={claimPanel.onChange}
        onClose={claimPanel.onClose}
        onSubmitClaim={claimPanel.onSubmit}
      />
    )}
  </Stack>
);

export default MobileMyPage;
