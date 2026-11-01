import { initializeApollo } from '@/apollo/client';
import { userVar, sessionReadyVar } from '@/apollo/store';
import { LOGIN_MUTATION, SIGNUP_MUTATION } from '@/apollo/member/mutation';
import { sweetMixinErrorAlert } from '@/libs/sweetAlert';
import { getCsrfToken } from './csrf';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';

type LoginInput = { memberNick: string; memberPassword: string };
type SignupInput = LoginInput & { memberPhone: string; memberType: string };
let revision = 0;
let restoring: Promise<void> | null = null;
function removeLegacyToken() { if (typeof window !== 'undefined') localStorage.removeItem('accessToken'); }
function announce() { localStorage.setItem('insu-session-change', String(Date.now())); }
export function updateUserInfo(member: Partial<CustomJwtPayload> | null) {
  userVar(member ? {
    memberPhone: '', memberNick: '', memberImage: '/img/profile/defaultUser.svg',
    memberAddress: '', memberDesc: '', memberProperties: 0, memberRank: 0,
    memberArticles: 0, memberPoints: 0, memberLikes: 0, memberViews: 0,
    memberWarnings: 0, memberBlocks: 0, ...member,
  } as CustomJwtPayload : null);
}
export async function refreshSession(): Promise<void> {
  if (typeof window === 'undefined') return;
  removeLegacyToken();
  const current = ++revision;
  try {
    const response = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
    if (!response.ok) throw new Error('Session unavailable');
    const data = await response.json();
    if (current === revision) {
      if (userVar()?._id !== data.member?._id) await initializeApollo().clearStore();
      if (current === revision) updateUserInfo(data.member ?? null);
    }
  } catch { if (current === revision) updateUserInfo(null); }
  finally { if (current === revision) sessionReadyVar(true); }
}
export function ensureSession(): Promise<void> {
  if (sessionReadyVar()) return Promise.resolve();
  if (!restoring) restoring = refreshSession().finally(() => { restoring = null; });
  return restoring;
}
async function authenticate(mutation: any, input: LoginInput | SignupInput) {
  ++revision;
  removeLegacyToken();
  try {
    const client = initializeApollo();
    const result = await client.mutate<{ login?: CustomJwtPayload; signup?: CustomJwtPayload }>({ mutation, variables: { input }, fetchPolicy: 'no-cache' });
    const member = result.data?.login ?? result.data?.signup;
    if (!member?._id) throw new Error('Sign-in failed');
    await client.clearStore();
    updateUserInfo(member);
    sessionReadyVar(true);
    announce();
  } catch (error: any) {
    sessionReadyVar(true);
    await sweetMixinErrorAlert(error?.message ?? 'Could not sign in');
    throw error;
  }
}
export const logIn = (input: LoginInput) => authenticate(LOGIN_MUTATION, input);
export const signUp = (input: SignupInput) => authenticate(SIGNUP_MUTATION, input);
export async function logOut(): Promise<void> {
  if (typeof window === 'undefined') return;
  const csrf = await getCsrfToken();
  const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', headers: { 'x-csrf-token': csrf } });
  if (!response.ok) { await sweetMixinErrorAlert('Could not sign out. Please try again.'); return; }
  ++revision;
  removeLegacyToken();
  await initializeApollo().clearStore();
  updateUserInfo(null);
  sessionReadyVar(true);
  announce();
  window.location.reload();
}
