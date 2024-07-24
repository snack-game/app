import {Member} from '@/apis/Auth/types';
import {Store} from '../types';

interface Token {
  accessToken: string;
  refreshToken: string;
  originalResponse: string;
}

export interface UserStore extends Store {
  user?: Member;

  saveUser: (user?: Member) => void;
}
