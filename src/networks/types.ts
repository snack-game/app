import {AxiosError, AxiosResponse} from 'axios';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export interface RequestParams {
  method: HttpMethod;
  url: string;
  queryParams?: Record<string, unknown>;
  requestBody?: FormData | unknown | string;
  isMultipart?: boolean;
}

export type AppResponse = AxiosResponse | AxiosError | null;
