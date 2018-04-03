import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';

export interface Authentication {
  user: object,
  jwt: string
}

export default class Strapi {
  private axios: AxiosInstance;

  /**
   * Default constructor.
   * @param baseURL Your Strapi host.
   * @param axiosConfig Extend Axios configuration.
   */
  constructor(baseURL: string, axiosConfig?: AxiosRequestConfig) {
    this.axios = axios.create({
      baseURL,
      paramsSerializer: qs.stringify,
      ...axiosConfig
    });
  }

  /**
   * Register a new user.
   * @param username
   * @param email
   * @param password
   * @returns Authentication object with user and token
   */
  public async register(
    username: string,
    email: string,
    password: string
  ): Promise<Authentication> {
    this.clearToken();
    const authentication: Authentication = await this.request('post', '/auth/local/register', {
      data: {
        email,
        password,
        username
      }
    });
    this.setToken(authentication.jwt);
    return authentication;
  }

  /**
   * Login by getting an authentication token.
   * @param identifier Can either be an email or a username.
   * @param password
   * @returns Authentication object with user and token
   */
  public async login(identifier: string, password: string): Promise<Authentication> {
    this.clearToken();
    const authentication: Authentication = await this.request('post', '/auth/local', {
      data: {
        identifier,
        password
      }
    });
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
   * @returns Data
   */
  public async request(
    method: string = 'get',
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
      throw error.response.data.message;
    }
  }
  
  /**
   * List entries
   * @param contentType
   * @param params Filter and order queries.
   */
  public getEntries(contentType: string, params?: AxiosRequestConfig['params']): Promise<any[]> {
    return this.request('get', `/${contentType}`, {
      params
    });
  }
  
  /**
   * Get a specific entry
   * @param contentType
   * @param id 
   */
  public getEntry(contentType: string, id: string): Promise<any> {
    return this.request('get', `/${contentType}/${id}`);
  }
  
  /**
   * Create data
   * @param contentType 
   * @param data New entry
   */
  public createEntry(contentType: string, data: AxiosRequestConfig['data']): Promise<any> {
    return this.request('post', `/${contentType}`, {
      data
    });
  }
  
  /**
   * Update data
   * @param contentType 
   * @param id 
   * @param data 
   */
  public updateEntry(contentType: string, id: string, data: AxiosRequestConfig['data']): Promise<any> {
    return this.request('put', `/${contentType}/${id}`, {
      data
    });
  }
  
  /**
   * 
   * @param contentType 
   * @param id 
   */
  public deleteEntry(contentType: string, id: string): Promise<any> {
    return this.request('delete', `/${contentType}/${id}`);
  }
  
  private setToken(token: string): void {
    this.axios.defaults.headers.common.Authorization = 'Bearer ' + token;
  }

  private clearToken(): void {
    delete this.axios.defaults.headers.common.Authorization;
  }
}
