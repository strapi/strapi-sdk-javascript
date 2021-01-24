import axios, {
  Method,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios';
import * as Cookies from 'js-cookie';
import * as qs from 'qs';
import {
  Authentication,
  Provider,
  ProviderToken,
  StoreConfig,
  StrapiEmailData,
  StrapiGraphQLQuery,
  StrapiLoginData,
  StrapiOptions,
  StrapiRegistrationData,
  StrapiResetPasswordData,
  StrapiUser
} from './../types/types';


export default class Strapi {
  public axios: AxiosInstance;
  public storeConfig: StoreConfig;
  public options: StrapiOptions;

  /**
   * Default constructor.
   * @param options.url Your Strapi host.
   * @param options.requestConfig Extend Axios configuration.
   */
  constructor(
    options: StrapiOptions
  ) {
    this.options = options
    const baseURL = this.options.url || 'http://localhost:1337'
    const requestConfig = this.options.requestConfig
    const storeConfig = this.options.storeConfig
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
    method: Method,
    url: string,
    requestConfig ? :
    AxiosRequestConfig |
    StrapiLoginData |
    StrapiRegistrationData |
    StrapiResetPasswordData |
    StrapiEmailData |
    StrapiGraphQLQuery

  ): Promise < any > {
    try {
      const response: AxiosResponse = await this.axios.request({
        method,
        url,
        ...requestConfig
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message);
      } else {
        throw error;
      }
    }
  }

  /**
   * Register a new user.
   * @param username
   * @param email
   * @param password
   * @returns Authentication User token and profile
   */
  public async register(e: StrapiRegistrationData): Promise < Authentication > {
    this.clearToken();
    const authentication: Authentication = await this.request('post', '/auth/local/register', {
      data: e
    });
    this.setToken(authentication.jwt);
    return authentication;
  }

  /**
   * Login by getting an authentication token.
   * @param identifier Can either be an email or a username.
   * @param password
   * @returns Authentication User token and profile
   */
  public async login(e: StrapiLoginData): Promise < Authentication > {
    this.clearToken();
    const authentication: Authentication = await this.request('post', '/auth/local', {
      data: e
    });
    this.setToken(authentication.jwt);
    return authentication;
  }

  // logout delete the token 

  public logout() {
    this.clearToken();
  }

  async me(): Promise < StrapiUser > {
   let user!: StrapiUser;
    const jwt = this.syncToken();
    if (!jwt) {
      return null as any;
    }

    try {
      user = await this.findById('users', 'me');
    } catch (e) {
      this.clearToken();
    }

    return user;
  }
  /**
   * Sends an email to a user with the link of your reset password page.
   * This link contains an URL param code which is required to reset user password.
   * Received link url format https://my-domain.com/rest-password?code=privateCode.
   * @param email
   */
  public async forgotPassword(e: StrapiEmailData): Promise < void > {
    this.clearToken();
    await this.request('post', '/auth/forgot-password', {
      data: e
    });
  }

  /**
   * Reset the user password.
   * @param code Is the url params received from the email link (see forgot password).
   * @param password
   * @param passwordConfirmation
   */
  public async resetPassword(e: StrapiResetPasswordData): Promise < void > {
    this.clearToken();
    await this.request('post', '/auth/reset-password', {
      data: e
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
    params ? : ProviderToken
  ): Promise < Authentication > {
    this.clearToken();
    // Handling browser query
    if (this.isBrowser()) {
      params = qs.parse(window.location.search, {
        ignoreQueryPrefix: true
      });
    }
    const authentication: Authentication = await this.request(
      'get',
      `/auth/${provider}/callback`, {
        params
      }
    );
    this.setToken(authentication.jwt);
    return authentication;
  }

  /**
   * List entries
   * @param entry
   * @param params Filter and order queries.
   */
  public find(
    entry: string,
    params ? : AxiosRequestConfig['params']
  ): Promise < object[] > {
    return this.request('get', `/${entry}`, {
      params
    });
  }

  /**
   * Get the total count of entries with the provided criteria
   * @param entry
   * @param params Filter and order queries.
   */
  public count(
    entry: string,
    params ? : AxiosRequestConfig['params']
  ): Promise < object[] > {
    return this.request('get', `/${entry}/count`, {
      params
    });
  }

  /**
   * Get a specific entry
   * @param entity Type of entry pluralized
   * @param id ID of entry
   */
  public findById(entry: string, id: string): Promise < object > {
    return this.request('get', `/${entry}/${id}`);
  }

  /**
   * Create data
   * @param entry Type of entry pluralized
   * @param data New entry
   */
  public create(
    entry: string,
    data: AxiosRequestConfig['data']
  ): Promise < object > {
    return this.request('post', `/${entry}`, {
      data
    });
  }

  /**
   * Update data
   * @param entry Type of entry pluralized
   * @param id ID of entry
   * @param data
   */
  public update(
    entry: string,
    id: string,
    data: AxiosRequestConfig['data']
  ): Promise < object > {
    return this.request('put', `/${entry}/${id}`, {
      data
    });
  }

  /**
   * Delete an entry
   * @param entry Type of entry pluralized
   * @param id ID of entry
   */
  public delete(
    entry: string,
    id: string
  ): Promise < object > {
    return this.request('delete', `/${entry}/${id}`);
  }

  /**
   * Search for files
   * @param query Keywords
   */
  public searchFiles(query: string): Promise < object[] > {
    return this.request('get', `/upload/search/${decodeURIComponent(query)}`);
  }

  /**
   * Get files
   * @param params Filter and order queries
   * @returns Object[] Files data
   */
  public findFiles(params ? : AxiosRequestConfig['params']): Promise < object[] > {
    return this.request('get', '/upload/files', {
      params
    });
  }


  /**
   * Get file
   * @param id ID of entry
   */
  public getFile(id: string): Promise < object > {
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
    requestConfig ? : AxiosRequestConfig
  ): Promise < object > {
    return this.request('post', '/upload', {
      data,
      ...requestConfig
    });
  }

  /**
   * qyery data graphql
   * @param query query data 
   */

  public graphql(query: StrapiGraphQLQuery): Promise < object[] > {
    return this.request('post', `/graphql`, {
      data: query
    });
  }


  /**
   * Set token on Axios configuration
   * @param token Retrieved by register or login
   */
  public setToken(token: string, comesFromStorage ? : boolean): void {
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

  public getToken(): string {
    let token;
    if (this.isBrowser()) {
      if (this.storeConfig.cookie) {
        token = Cookies.get(this.storeConfig.cookie.key);
      } else if (this.storeConfig.localStorage) {
        token = JSON.parse(
          window.localStorage.getItem(
            this.storeConfig.localStorage.key
          ) as string
        );
      }
    }
    return token;
  }
  private syncToken(jwt ? : string | undefined) {
    if (!jwt) {
      jwt = this.getToken();
    }
    if (jwt) {
      this.setToken(jwt);
    } else {
      this.clearToken();
    }
    return jwt;
  }

  /**
   * Check if it runs on browser
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
