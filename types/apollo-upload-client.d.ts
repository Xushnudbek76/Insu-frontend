declare module 'apollo-upload-client' {
  import { ApolloLink } from '@apollo/client';
  import { FetchOptions } from '@apollo/client/link/http';

  export interface UploadLinkOptions extends FetchOptions {
    uri?: string;
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
  }

  export function createUploadLink(options?: UploadLinkOptions): ApolloLink;
}
