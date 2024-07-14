import axios, {AxiosResponse} from 'axios';
import {get, set} from 'lodash';
import qs from 'qs';
import {RequestParams} from './types';
import {useUserStore} from '@/store';

export const client = axios.create({
  timeout: 30000,
  paramsSerializer: (params: unknown) =>
    qs.stringify(params, {arrayFormat: 'repeat'}),
  withCredentials: true,
  baseURL: 'https://dev-api.snackga.me/',
});

client.interceptors.request.use(config => {
  const {cookie} = useUserStore.getState();
  if (cookie) {
    set(config, 'headers.cookie', cookie);
  }
  return config;
});

client.interceptors.response.use(
  response => {
    const {headers} = response;
    const cookie = get(headers, 'set-cookie');
    if (cookie) {
      useUserStore.getState().saveCookie(cookie);
    }
    return response;
  },
  err => {
    return Promise.reject(err);
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
    default:
      return Promise.reject(new Error('Invalid HttpMethod'));
  }
};

export * from './types';
