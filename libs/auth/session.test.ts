import { ApolloClient, InMemoryCache, ApolloLink, gql } from '@apollo/client';
import { initializeApollo } from '@/apollo/client';
import { userVar, sessionReadyVar } from '@/apollo/store';
import { logIn, logOut, refreshSession } from './index';
jest.mock('@/apollo/client', () => ({ initializeApollo: jest.fn() }));
jest.mock('@/libs/sweetAlert', () => ({ sweetMixinErrorAlert: jest.fn() }));

describe('Cookie account-session privacy', () => {
  let client: ApolloClient;
  let storage: {setItem:jest.Mock;removeItem:jest.Mock};
  beforeEach(() => {
    jest.clearAllMocks();
    client = new ApolloClient({cache:new InMemoryCache(),link:ApolloLink.empty()});
    (initializeApollo as jest.Mock).mockReturnValue(client);
    storage={setItem:jest.fn(),removeItem:jest.fn()};
    Object.defineProperty(globalThis,'window',{value:{location:{reload:jest.fn()}},configurable:true});
    Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
    Object.defineProperty(globalThis,'document',{value:{cookie:'insu-csrf=test-csrf'},configurable:true});
    sessionReadyVar(false); userVar(null);
  });
  afterEach(()=>{client.stop();delete (globalThis as any).document;});
  it('clears the previous account cache and never stores an authentication token',async()=>{
    client.cache.writeFragment({id:'Policy:private-a',fragment:gql`fragment Private on Policy{_id packageName}`,data:{__typename:'Policy',_id:'private-a',packageName:'Account A private policy'}});
    jest.spyOn(client,'mutate').mockResolvedValue({data:{login:{_id:'account-b',memberNick:'B'}}} as any);
    userVar({_id:'account-a'} as any);
    await logIn({memberNick:'B',memberPassword:'test-only'});
    expect(client.cache.extract()).toEqual({});
    expect(userVar()?._id).toBe('account-b');
    expect(storage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(storage.setItem.mock.calls.every(([key])=>key==='insu-session-change')).toBe(true);
  });
  it('waits for server identity before marking session hydration ready',async()=>{
    let resolve:any;
    globalThis.fetch=jest.fn().mockReturnValue(new Promise(done=>{resolve=done;}));
    const loading=refreshSession();
    expect(sessionReadyVar()).toBe(false);
    resolve({ok:true,json:async()=>({member:{_id:'account-a',memberNick:'A'}})});
    await loading;
    expect(userVar()?._id).toBe('account-a');
    expect(sessionReadyVar()).toBe(true);
  });
  it('does not let a stale account refresh replace a newer login during cache clearing',async()=>{
    globalThis.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({member:{_id:'old-account'}})});
    let release:any;
    jest.spyOn(client,'clearStore').mockImplementationOnce(()=>new Promise(done=>{release=done;}) as any);
    const old=refreshSession();
    await Promise.resolve();await Promise.resolve();await Promise.resolve();
    jest.spyOn(client,'mutate').mockResolvedValue({data:{login:{_id:'new-account',memberNick:'New'}}} as any);
    await logIn({memberNick:'New',memberPassword:'test-only'});
    release([]);await old;
    expect(userVar()?._id).toBe('new-account');
  });
  it('revokes the server session before clearing the local account',async()=>{
    userVar({_id:'account-a'} as any);
    globalThis.fetch=jest.fn().mockResolvedValue({ok:true});
    await logOut();
    expect(fetch).toHaveBeenCalledWith('/api/auth/logout',expect.objectContaining({method:'POST',credentials:'include',headers:{'x-csrf-token':'test-csrf'}}));
    expect(userVar()).toBeNull();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
