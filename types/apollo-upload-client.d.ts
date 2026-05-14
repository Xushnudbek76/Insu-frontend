declare module 'apollo-upload-client/UploadHttpLink.mjs' {
  import { ApolloLink } from '@apollo/client';
  import { FetchOptions } from '@apollo/client/link/http';

  export interface UploadLinkOptions extends FetchOptions {
    uri?: string;
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
  }

  export default class UploadHttpLink extends ApolloLink {
    constructor(options?: UploadLinkOptions);
  }
}
