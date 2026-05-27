import { NextPage } from 'next';
import { Box, Stack } from '@mui/material';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import withLayoutBasic from '@/layout/LayoutBasic';
import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import AddPackage from '@/libs/components/mypage/AddPackage';
import AgentClaims from '@/libs/components/mypage/AgentClaims';
import MyClaims from '@/libs/components/mypage/MyClaims';
import MyFavorites from '@/libs/components/mypage/MyFavorites';
import MyPackages from '@/libs/components/mypage/MyPackages';
import MyPageSidebar from '@/libs/components/mypage/MyPageSidebar';
import MyPolicies from '@/libs/components/mypage/MyPolicies';
import MyProfile from '@/libs/components/mypage/MyProfile';
import SubmitClaimPanel from '@/libs/components/mypage/SubmitClaimPanel';
import MobileMyPage from '@/libs/components/mobile/mypage/MobileMyPage';
import { useMyPageController } from '@/libs/components/mypage/useMyPageController';

const MyPage: NextPage = () => {
  const device = useDeviceDetect();
  const controller = useMyPageController();
  const { t, access, profile, policies, claims, agentClaims, agentPackages, favorites, packageCreation, claimPanel, summary, navigation } =
    controller;

  if (!access.authReady || !access.user?._id) {
    return (
      <Stack className='mypage-dashboard'>
        <Stack className='mypage-shell'>
          <Box className='mypage-loading-card'>{t('Loading your dashboard...')}</Box>
        </Stack>
      </Stack>
    );
  }

  if (device === 'mobile') {
    return <MobileMyPage t={t} access={access} profile={profile} policies={policies} claims={claims} agentClaims={agentClaims} agentPackages={agentPackages} favorites={favorites} packageCreation={packageCreation} claimPanel={claimPanel} summary={summary} navigation={navigation} />;
  }

  return (
    <Stack className='mypage-dashboard'>
      <Stack className='mypage-shell'>
        <MyPageSidebar
          user={access.user}
          profileForm={profile.form}
          isAdmin={access.isAdmin}
          activePolicies={summary.activePolicies}
          pendingClaims={summary.pendingClaims}
          navItems={summary.navItems}
          category={access.category}
          t={t}
          onAdminClick={navigation.onAdminClick}
          onCategoryChange={navigation.onCategoryChange}
          onLogout={navigation.onLogout}
        />

        <Stack className='mypage-content'>
          <Stack className='mypage-hero-card'>
            <Stack>
              <span>{t('Insurance Dashboard')}</span>
              <h1>{summary.navItems.find((item) => item.key === access.category)?.label ?? t('My Profile')}</h1>
              <p>{t('Manage your profile, policies, claims, and saved insurance packages in one place.')}</p>
            </Stack>
            <Box className='mypage-hero-badge'>
              <VerifiedOutlinedIcon />
              {t('Secure account area')}
            </Box>
          </Stack>

          {access.category === 'myProfile' && (
            <MyProfile
              profileForm={profile.form}
              t={t}
              onProfileChange={profile.onChange}
              onUploadProfileImage={profile.onUploadImage}
              onUpdateProfile={profile.onSubmit}
            />
          )}

          {access.category === 'addPackage' && access.isAgent && (
            <AddPackage
              packageForm={packageCreation.form}
              isEditing={packageCreation.isEditing}
              t={t}
              onPackageChange={packageCreation.onChange}
              onUploadPackageImages={packageCreation.onUploadImages}
              onSubmitPackage={packageCreation.onSubmit}
              onCancelEdit={packageCreation.onCancelEdit}
            />
          )}

          {access.category === 'myPackages' && access.isAgent && (
            <MyPackages
              packages={agentPackages.items}
              loading={agentPackages.loading}
              error={agentPackages.error}
              status={agentPackages.status}
              page={agentPackages.page}
              totalPages={agentPackages.totalPages}
              t={t}
              onStatusChange={agentPackages.onStatusChange}
              onEditPackage={agentPackages.onEdit}
              onUpdateStatus={agentPackages.onUpdateStatus}
              onPageChange={agentPackages.onPageChange}
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

          {access.category === 'myClaims' && (
            <MyClaims claims={claims.items} loading={claims.loading} error={claims.error} t={t} />
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
        </Stack>
      </Stack>

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
};

export const getStaticProps = async ({ locale = 'en' }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default withLayoutBasic(MyPage);
