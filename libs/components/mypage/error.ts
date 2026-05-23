interface GraphQLErrorLike {
  message?: string | null;
}

interface ApolloLikeError {
  graphQLErrors?: GraphQLErrorLike[] | null;
  message?: string | null;
}

const isApolloLikeError = (error: unknown): error is ApolloLikeError =>
  typeof error === 'object' && error !== null;

export const getMyPageErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!isApolloLikeError(error)) return fallbackMessage;

  const graphQLErrorMessage = error.graphQLErrors?.[0]?.message?.replace('Definer: ', '').trim();
  if (graphQLErrorMessage) return graphQLErrorMessage;

  const message = error.message?.trim();
  return message || fallbackMessage;
};
