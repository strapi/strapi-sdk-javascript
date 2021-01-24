import {
  AxiosRequestConfig
} from 'axios';

export interface Authentication {
  user: object;
  jwt: string;
}
export type StrapiUser = Record < string, any > ;

export type Provider = 'facebook' | 'google' | 'github' | 'twitter';

export interface StrapiLoginData {

  identifier: string;
  password: string;
}

export interface ProviderToken {
  access_token ? : string;
  code ? : string;
  oauth_token ? : string;
}

export interface CookieConfig {
  key: string;
  options: object;
}

export interface LocalStorageConfig {
  key: string;
}

export interface StoreConfig {
  cookie ? : CookieConfig | false;
  localStorage ? : LocalStorageConfig | false;
}
export interface StrapiOptions {
  url: string
  storeConfig ? : StoreConfig,
    requestConfig ? : AxiosRequestConfig
}
export interface StrapiLoginResult {
  user: StrapiUser
  jwt: string
}

export interface StrapiGraphQLQuery {
  query: string;
}

export interface StrapiRegistrationData {
  username: string;
  email: string;
  password: string;
}

export interface StrapiEmailData {
  email: string;
}

export interface StrapiResetPasswordData {
  code: string;
  password: string;
  passwordConfirmation: string;
}
