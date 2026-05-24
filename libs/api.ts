const DEFAULT_GRAPHQL_URL = 'http://localhost:3007/graphql';

export const getApiBaseUrl = (): string => {
  const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (explicitApiUrl) return explicitApiUrl.replace(/\/$/, '');

  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? DEFAULT_GRAPHQL_URL;

  try {
    const url = new URL(graphqlUrl);
    return url.origin;
  } catch {
    return 'http://localhost:3007';
  }
};

export const toAssetUrl = (assetPath?: string | null): string | undefined => {
  if (!assetPath) return undefined;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  if (/^\/?img\//i.test(assetPath)) return `/${assetPath.replace(/^\/+/, '')}`;
  return `${getApiBaseUrl()}/${assetPath.replace(/^\/+/, '')}`;
};
