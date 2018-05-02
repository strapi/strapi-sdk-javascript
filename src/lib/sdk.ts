import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as Cookies from 'js-cookie';
import * as qs from 'qs';

export interface Authentication {
  user: object;
  jwt: string;
}

export type Provider = 'facebook' | 'google' | 'github' | 'twitter';

export interface ProviderToken {
  access_token?: string;
  code?: string;
  oauth_token?: string;
}

export interface CookieConfig {
  key: string;
  options: object;
}

export interface LocalStorageConfig {
  key: string;
}

export interface StoreConfig {
  cookie?: CookieConfig | false;
  localStorage?: LocalStorageConfig | false;
}

export default class Strapi {
  public axios: AxiosInstance;
  public storeConfig: StoreConfig;

  /**
   * Default constructor.
   * @param baseURL Your Strapi host.
   * @param axiosConfig Extend Axios configuration.
   */
  constructor(
    baseURL: string,
    storeConfig?: StoreConfig,
    requestConfig?: AxiosRequestConfig
  ) {
    this.axios = axios.create({
      baseURL,
      paramsSerializer: qs.stringify,
      ...requestConfig
    });
    this.storeConfig = {
      cookie: {
        key: 'jwt',
        options: {
          path: '/'
        }
      },
      localStorage: {
        key: 'jwt'
      },
      ...storeConfig
    };

    if (this.isBrowser()) {
      let existingToken;
      if (this.storeConfig.cookie) {
        existingToken = Cookies.get(this.storeConfig.cookie.key);
      } else if (this.storeConfig.localStorage) {
        existingToken = JSON.parse(window.localStorage.getItem(
          this.storeConfig.localStorage.key
        ) as string);
      }
      if (existingToken) {
        this.setToken(existingToken, true);
      }
    }
  }

  /**
   * Axios request
   * @param method Request method
   * @param url Server URL
   * @param requestConfig Custom Axios config
   */
  public async request(
    method: string,
    url: string,
    requestConfig?: AxiosRequestConfig
  ): Promise<any> {
    try {
      const response: AxiosResponse = await this.axios.request({
        method,
        url,
        ...requestConfig
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }

  /**
   * Register a new user.
   * @param username
   * @param email
   * @param password
   * @returns Authentication User token and profile
   */
  public async register(
    username: string,
    email: string,
    password: string
  ): Promise<Authentication> {
    this.clearToken();
    const authentication: Authentication = await this.request(
      'post',
      '/auth/local/register',
      {
        data: {
          email,
          password,
          username
        }
      }
    );
    this.setToken(authentication.jwt);
    return authentication;
  }

  /**
   * Login by getting an authentication token.
   * @param identifier Can either be an email or a username.
   * @param password
   * @returns Authentication User token and profile
   */
  public async login(
    identifier: string,
    password: string
  ): Promise<Authentication> {
    this.clearToken();
    const authentication: Authentication = await this.request(
      'post',
      '/auth/local',
      {
        data: {
          identifier,
          password
        }
      }
    );
    this.setToken(authentication.jwt);
    return authentication;
  }

  /**
   * Sends an email to a user with the link of your reset password page.
   * This link contains an URL param code which is required to reset user password.
   * Received link url format https://my-domain.com/rest-password?code=privateCode.
   * @param email
   * @param url Link that user will receive.
   */
  public async forgotPassword(email: string, url: string): Promise<void> {
    this.clearToken();
    await this.request('post', '/auth/forgot-password', {
      data: {
        email,
        url
      }
    });
  }

  /**
   * Reset the user password.
   * @param code Is the url params received from the email link (see forgot password).
   * @param password
   * @param passwordConfirmation
   */
  public async resetPassword(
    code: string,
    password: string,
    passwordConfirmation: string
  ): Promise<void> {
    this.clearToken();
    await this.request('post', '/auth/reset-password', {
      data: {
        code,
        password,
        passwordConfirmation
      }
    });
  }

  /**
   * Retrieve the connect provider URL
   * @param provider
   */
  public getProviderAuthenticationUrl(provider: Provider): string {
    return `${this.axios.defaults.baseURL}/connect/${provider}`;
  }

  /**
   * Authenticate the user with the token present on the URL (for browser) or in `params` (on Node.js)
   * @param provider
   * @param params
   */
  public async authenticateProvider(
    provider: Provider,
    params?: ProviderToken
  ): Promise<Authentication> {
    this.clearToken();
    // Handling browser query
    if (this.isBrowser()) {
      params = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    }
    const authentication: Authentication = await this.request(
      'get',
      `/auth/${provider}/callback`,
      {
        params
      }
    );
    this.setToken(authentication.jwt);
    return authentication;
  }

  /**
   * List entries
   * @param contentType
   * @param params Filter and order queries.
   */
  public getEntries(
    contentType: string,
    params?: AxiosRequestConfig['params']
  ): Promise<object[]> {
    return this.request('get', `/${contentType}`, {
      params
    });
  }

  /**
   * Get a specific entry
   * @param contentType Type of entry
   * @param id ID of entry
   */
  public getEntry(contentType: string, id: string): Promise<object> {
    return this.request('get', `/${contentType}/${id}`);
  }

  /**
   * Create data
   * @param contentType Type of entry
   * @param data New entry
   */
  public createEntry(
    contentType: string,
    data: AxiosRequestConfig['data']
  ): Promise<object> {
    return this.request('post', `/${contentType}`, {
      data
    });
  }

  /**
   * Update data
   * @param contentType Type of entry
   * @param id ID of entry
   * @param data
   */
  public updateEntry(
    contentType: string,
    id: string,
    data: AxiosRequestConfig['data']
  ): Promise<object> {
    return this.request('put', `/${contentType}/${id}`, {
      data
    });
  }

  /**
   * Delete an entry
   * @param contentType Type of entry
   * @param id ID of entry
   */
  public deleteEntry(contentType: string, id: string): Promise<object> {
    return this.request('delete', `/${contentType}/${id}`);
  }

  /**
   * Search for files
   * @param query Keywords
   */
  public searchFiles(query: string): Promise<object[]> {
    return this.request('get', `/upload/search/${decodeURIComponent(query)}`);
  }

  /**
   * Get files
   * @param params Filter and order queries
   * @returns Object[] Files data
   */
  public getFiles(params?: AxiosRequestConfig['params']): Promise<object[]> {
    return this.request('get', '/upload/files', {
      params
    });
  }

  /**
   * Get file
   * @param id ID of entry
   */
  public getFile(id: string): Promise<object> {
    return this.request('get', `/upload/files/${id}`);
  }

  /**
   * Upload files
   *
   * ### Browser example
   * ```js
   * const form = new FormData();
   * form.append('files', fileInputElement.files[0], 'file-name.ext');
   * form.append('files', fileInputElement.files[1], 'file-2-name.ext');
   * const files = await strapi.upload(form);
   * ```
   *
   * ### Node.js example
   * ```js
   * const FormData = require('form-data');
   * const fs = require('fs');
   * const form = new FormData();
   * form.append('files', fs.createReadStream('./file-name.ext'), 'file-name.ext');
   * const files = await strapi.upload(form, {
   *   headers: form.getHeaders()
   * });
   * ```
   *
   * @param data FormData
   * @param requestConfig
   */
  public upload(
    data: FormData,
    requestConfig?: AxiosRequestConfig
  ): Promise<object> {
    return this.request('post', '/upload', {
      data,
      ...requestConfig
    });
  }

  /**
   * Set token on Axios configuration
   * @param token Retrieved by register or login
   */
  public setToken(token: string, comesFromStorage?: boolean): void {
    this.axios.defaults.headers.common.Authorization = 'Bearer ' + token;
    if (this.isBrowser() && !comesFromStorage) {
      if (this.storeConfig.localStorage) {
        window.localStorage.setItem(
          this.storeConfig.localStorage.key,
          JSON.stringify(token)
        );
      }
      if (this.storeConfig.cookie) {
        Cookies.set(
          this.storeConfig.cookie.key,
          token,
          this.storeConfig.cookie.options
        );
      }
    }
  }

  /**
   * Remove token from Axios configuration
   */
  public clearToken(): void {
    delete this.axios.defaults.headers.common.Authorization;
    if (this.isBrowser()) {
      if (this.storeConfig.localStorage) {
        window.localStorage.removeItem(this.storeConfig.localStorage.key);
      }
      if (this.storeConfig.cookie) {
        Cookies.remove(
          this.storeConfig.cookie.key,
          this.storeConfig.cookie.options
        );
      }
    }
  }

  /**
   * Check if it runs on browser
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
