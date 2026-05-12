import { jwtDecode } from 'jwt-decode';

import { initializeApollo } from '@/apollo/client';
import { userVar } from '@/apollo/store';
import { LOGIN_MUTATION, SIGNUP_MUTATION } from '@/apollo/member/mutation';
import { sweetMixinErrorAlert } from '@/libs/sweetAlert';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';

type AuthResponse = {
  accessToken: string;
};

type LoginInput = {
  memberNick: string;
  memberPassword: string;
};

type SignupInput = {
  memberNick: string;
  memberPassword: string;
  memberPhone: string;
  memberType: string;
};

export const getJwtToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') ?? '';
};

export const setJwtToken = (token: string) => {
  localStorage.setItem('accessToken', token);
};

export const logIn = async (input: LoginInput) => {
  try {
    const token = await requestAuthToken(LOGIN_MUTATION, { input });
    updateSession(token);
  } catch (error) {
    console.warn('Login failed', error);
    logOut();
    throw error;
  }
};

export const signUp = async (input: SignupInput) => {
  try {
    const token = await requestAuthToken(SIGNUP_MUTATION, { input });
    updateSession(token);
  } catch (error) {
    console.warn('Signup failed', error);
    logOut();
    throw error;
  }
};

export const logOut = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.setItem('logout', Date.now().toString());
  userVar(null);
  window.location.reload();
};

const updateSession = (token: string) => {
  if (!token) return;
  if (typeof window === 'undefined') return;

  setJwtToken(token);
  localStorage.setItem('login', Date.now().toString());
  updateUserInfo(token);
};

export const updateUserInfo = (token: string) => {
  if (!token) return;

  const claims = jwtDecode<CustomJwtPayload>(token);
  userVar({
    _id: claims._id ?? '',
    memberType: claims.memberType ?? '',
    memberStatus: claims.memberStatus ?? '',
    memberAuthType: claims.memberAuthType ?? '',
    memberPhone: claims.memberPhone ?? '',
    memberNick: claims.memberNick ?? '',
    memberFullName: claims.memberFullName ?? '',
    memberImage: claims.memberImage ?? '/img/profile/defaultUser.svg',
    memberAddress: claims.memberAddress ?? '',
    memberDesc: claims.memberDesc ?? '',
    memberProperties: claims.memberProperties ?? 0,
    memberRank: claims.memberRank ?? 0,
    memberArticles: claims.memberArticles ?? 0,
    memberPoints: claims.memberPoints ?? 0,
    memberLikes: claims.memberLikes ?? 0,
    memberViews: claims.memberViews ?? 0,
    memberWarnings: claims.memberWarnings ?? 0,
    memberBlocks: claims.memberBlocks ?? 0,
    exp: claims.exp,
    iat: claims.iat,
    iss: claims.iss,
    aud: claims.aud,
    sub: claims.sub,
  });
};

const requestAuthToken = async (
  mutation: any,
  variables: Record<string, unknown>,
): Promise<string> => {
  const client = initializeApollo();

  try {
    const result = await client.mutate<{ login?: AuthResponse; signup?: AuthResponse }>({
      mutation,
      variables,
      fetchPolicy: 'no-cache',
    });

    const payload = result.data?.login ?? result.data?.signup;
    if (!payload?.accessToken) {
      throw new Error('Access token missing');
    }

    return payload.accessToken;
  } catch (error: any) {
    const message = error?.graphQLErrors?.[0]?.message ?? error?.message;
    if (message) {
      await sweetMixinErrorAlert(message.replace('Definer: ', ''));
    }
    throw error;
  }
};
