import { toAssetUrl } from '@/libs/api';

export const ADMIN_DEFAULT_USER_IMAGE = '/img/profile/defaultUser.svg';

export const adminUserImage = (image?: string | null) => {
  const normalized = image?.trim();
  if (!normalized || normalized === ADMIN_DEFAULT_USER_IMAGE) return ADMIN_DEFAULT_USER_IMAGE;
  return toAssetUrl(normalized) ?? ADMIN_DEFAULT_USER_IMAGE;
};
