import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { BASE_URL } from '../constants/api_constants';

export interface NetworkException {
  status: number;
  message: string;
}

export interface NetworkResponse<T> {
  status: number;
  message: string;
  data: T;
}

class NetworkService {
  private axiosInstance = axios.create({
    baseURL: BASE_URL,
  });

  private async handleRequest<T>({
    config,
  }: {
    config: AxiosRequestConfig;
  }): Promise<NetworkResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request(config);
      return {
        status: response.status,
        message: response.statusText,
        data: response.data,
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw {
          status: error.response?.status || 500,
          message: error.response?.data['error'] || 'Network Error',
        } as NetworkException;
      }
      throw { status: 500, message: 'Unknown Error' } as NetworkException;
    }
  }

  async get<T>({
    url,
    timeOutDuration = 1000,
    retryDelay = 2000,
    retryAttempts = 2,
    headers = {},
  }: {
    url: string;
    timeOutDuration?: number;
    retryDelay?: number;
    retryAttempts?: number;
    headers?: Record<string, string>;
  }): Promise<NetworkResponse<T>> {
    return this.retryRequest<T>({
      requestFn: () =>
        this.handleRequest<T>({
          config: {
            url,
            method: 'GET',
            headers,
            timeout: timeOutDuration,
          },
        }),
      attempts: retryAttempts,
      delay: retryDelay,
    });
  }

  async post<T>({
    url,
    body,
    headers = {},
    timeOutDuration = 1000,
  }: {
    url: string;
    body: any;
    headers?: Record<string, string>;
    timeOutDuration?: number;
  }): Promise<NetworkResponse<T>> {
    return this.handleRequest<T>({
      config: {
        url,
        method: 'POST',
        data: body,
        headers,
        timeout: timeOutDuration,
      },
    });
  }

  async put<T>({
    url,
    body,
    headers = {},
    timeOutDuration = 1000,
  }: {
    url: string;
    body: any;
    headers?: Record<string, string>;
    timeOutDuration?: number;
  }): Promise<NetworkResponse<T>> {
    return this.handleRequest<T>({
      config: {
        url,
        method: 'PUT',
        data: body,
        headers,
        timeout: timeOutDuration,
      },
    });
  }

  async delete<T>({
    url,
    timeOutDuration = 1000,
  }: {
    url: string;
    timeOutDuration?: number;
  }): Promise<NetworkResponse<T>> {
    return this.handleRequest<T>({
      config: {
        url,
        method: 'DELETE',
        timeout: timeOutDuration,
      },
    });
  }

  private async retryRequest<T>({
    requestFn,
    attempts,
    delay,
  }: {
    requestFn: () => Promise<NetworkResponse<T>>;
    attempts: number;
    delay: number;
  }): Promise<NetworkResponse<T>> {
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        if (i < attempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
}

export default new NetworkService();
