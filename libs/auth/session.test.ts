import { ApolloClient, InMemoryCache, ApolloLink, gql } from '@apollo/client';
import { initializeApollo } from '@/apollo/client';
import { jwtDecode } from 'jwt-decode';
import { userVar } from '@/apollo/store';
import { logIn } from './index';
jest.mock('@/apollo/client', () => ({ initializeApollo: jest.fn() }));
jest.mock('jwt-decode', () => ({ jwtDecode: jest.fn() }));
jest.mock('@/libs/sweetAlert', () => ({ sweetMixinErrorAlert: jest.fn() }));
describe('Account switch privacy', () => {
  it('clears_previous_account_policy_cache_before_publishing_new_identity', async () => {
    const cache = new InMemoryCache();
    const client = new ApolloClient({ cache, link: ApolloLink.empty() });
    cache.writeFragment({
      id: 'Policy:private-a',
      fragment: gql`
        fragment PrivatePolicy on Policy {
          _id
          packageName
        }
      `,
      data: {
        __typename: 'Policy',
        _id: 'private-a',
        packageName: 'Account A private policy',
      },
    });
    (initializeApollo as jest.Mock).mockReturnValue(client);
    jest
      .spyOn(client, 'mutate')
      .mockResolvedValue({
        data: { login: { accessToken: 'test-token-b' } },
      } as any);
    (jwtDecode as jest.Mock).mockReturnValue({
      _id: 'account-b',
      memberNick: 'B',
    });
    Object.defineProperty(globalThis, 'window', {
      value: { location: { reload: jest.fn() } },
      configurable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: { setItem: jest.fn(), removeItem: jest.fn() },
      configurable: true,
    });
    userVar({ _id: 'account-a' } as any);
    await logIn({ memberNick: 'B', memberPassword: 'test-only' });
    expect(cache.extract()).toEqual({});
    expect(userVar()?._id).toBe('account-b');
    client.stop();
  });
});
