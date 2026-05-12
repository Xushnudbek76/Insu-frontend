import { useMemo } from 'react';
import { ApolloClient, InMemoryCache, ApolloLink, from, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { getJwtToken } from '@/libs/auth';

let apolloClient: ApolloClient | undefined;

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:3001/graphql';

const createAuthLink = () =>
  setContext((_, { headers }) => {
    const token = getJwtToken();

    return {
      headers: {
        ...headers,
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    };
  });

const createHttpLink = (): ApolloLink =>
  new HttpLink({
    uri: GRAPHQL_ENDPOINT,
    credentials: 'include',
  });

const errorLink = onError((error: any) => {
  const { graphQLErrors, networkError } = error;

  if (graphQLErrors?.length) {
    graphQLErrors.forEach((graphQLError: any) => {
      const { message, locations, path } = graphQLError;
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations,
        )}, Path: ${path}`,
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

function createApolloClient() {
  const authLink = createAuthLink();
  const httpLink = createHttpLink();

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, authLink.concat(httpLink)]),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState: Record<string, unknown> | null = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }

  if (typeof window === 'undefined') {
    return _apolloClient;
  }

  if (!apolloClient) {
    apolloClient = _apolloClient;
  }

  return _apolloClient;
}

export function useApollo(initialState: Record<string, unknown> | null) {
  return useMemo(() => initializeApollo(initialState), [initialState]);
}
