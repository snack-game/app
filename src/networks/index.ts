import axios, {AxiosResponse} from 'axios';
import qs from 'qs';
import {RequestParams} from './types';
import {useUserStore} from '@/store';
import {requestRenew, requestSignOut} from '@/apis/Auth';
import CookieManager from '@react-native-cookies/cookies';

export const client = axios.create({
  timeout: 30000,
  paramsSerializer: (params: unknown) =>
    qs.stringify(params, {arrayFormat: 'repeat'}),
  baseURL: 'https://api.snackga.me/',
});

client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response) {
      const status = error.response.status;
      const {code} = error.response.data;
      const originalRequest = error.config;
      console.error(originalRequest);
      console.error(`status: ${status}, code: ${code}`);
      if (status === 401 && code === 'TOKEN_EXPIRED_EXCEPTION') {
        console.log('renew requested');
        await requestRenew();
        console.log('renew succeeded');
        return request(originalRequest);
      }
      if (
        status === 401 &&
        originalRequest.method === 'patch' &&
        originalRequest.url === '/tokens/me' &&
        code === 'REFRESH_TOKEN_EXPIRED_EXCEPTION'
      ) {
        console.log('logout due to refresh token expired');
        await requestSignOut();
        await CookieManager.clearAll();
        useUserStore.getState().clear();
      }
      if (
        status === 401 &&
        useUserStore.getState().user &&
        code === 'TOKEN_UNRESOLVABLE_EXCEPTION'
      ) {
        console.log('logout due to missing token');
        await CookieManager.clearAll();
        useUserStore.getState().clear();
      }
    }
    return Promise.reject(error);
  },
);

export const request = async <T>({
  method,
  url,
  queryParams,
  requestBody,
  isMultipart,
}: RequestParams): Promise<AxiosResponse<T>> => {
  let headers = {};
  if (isMultipart) {
    headers = {'Content-Type': 'multipart/form-data'};
  }

  switch (method) {
    case 'get':
      return client.get(url, {params: queryParams, headers});
    case 'post':
      return client.post(url, requestBody, {params: queryParams, headers});
    case 'put':
      return client.put(url, requestBody, {params: queryParams, headers});
    case 'delete':
      return client.delete(url, {data: requestBody, params: queryParams});
    case 'patch':
      return client.patch(url, requestBody, {params: queryParams, headers});
    default:
      return Promise.reject(new Error('Invalid HttpMethod'));
  }
};

export * from './types';
