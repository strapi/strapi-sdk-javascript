import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';

export interface Authentication {
  user: object;
  jwt: string;
}

export default class Strapi {
  public axios: AxiosInstance;

  /**
   * Default constructor.
   * @param baseURL Your Strapi host.
   * @param axiosConfig Extend Axios configuration.
   */
  constructor(baseURL: string, requestConfig?: AxiosRequestConfig) {
    this.axios = axios.create({
      baseURL,
      paramsSerializer: qs.stringify,
      ...requestConfig
    });
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
   * @param data Files
   * @param requestConfig
   */
  public upload(
    data: any,
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
  public setToken(token: string): void {
    this.axios.defaults.headers.common.Authorization = 'Bearer ' + token;
  }

  /**
   * Remove token from Axios configuration
   */
  private clearToken(): void {
    delete this.axios.defaults.headers.common.Authorization;
  }
}
