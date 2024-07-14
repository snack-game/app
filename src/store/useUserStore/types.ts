import {Member} from '@/apis/Auth/types';
import {Store} from '../types';

export interface UserStore extends Store {
  user?: Member;
  cookie?: string[];

  saveUser: (user?: Member) => void;
  saveCookie: (val?: string[]) => void;
  clearUser: () => void;
}
