import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import qs from 'qs'

export class Strapi {
    private axios: AxiosInstance
    private authentication: object = {}

    /**
     * Default constructor.
     * @param baseURL Your Strapi host.
     * @param axiosConfig Extend Axios configuration.
     */
    constructor (baseURL: string, axiosConfig?: AxiosRequestConfig) {
        this.axios = axios.create({
            baseURL,
            paramsSerializer: qs.stringify,
            ...axiosConfig
        })
    }

    /**
     * Register a new user.
     * @param username
     * @param email
     * @param password
     */
    public async register(username: string, email: string, password: string): Promise<object> {
        this.authentication = await this.axios.post('/auth/local/register', {
            email,
            password,
            username
        })
        return this.authentication
    }

    /**
     * Login by getting an authentication token.
     * @param identifier Can either be an email or a username.
     * @param password
     */
    public async login(identifier: string, password: string): Promise<object> {
        this.authentication = await this.axios.post('/auth/local', {
            identifier,
            password
        })
        return this.authentication
    }

    /**
     * Sends an email to a user with the link of your reset password page.
     * This link contains an URL param code which is required to reset user password.
     * Received link url format http://my-domain.com/rest-password?code=privateCode.
     * @param email 
     * @param url Link that user will receive.
     */
    public async forgotPassword(email: string, url: string): Promise<any> {
        await this.axios.post('/auth/forgot-password', {
            email,
            url
        })
    }

    /**
     * Reset the user password.
     * @param code Is the url params received from the email link (see forgot password).
     * @param password 
     * @param passwordConfirmation 
     */
    public async resetPassword(code: string, password: string, passwordConfirmation: string): Promise<any>  {
        await this.axios.post('/auth/reset-password', {
            code,
            password,
            passwordConfirmation
        })
    }
}
