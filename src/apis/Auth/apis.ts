import {request} from '@/networks';
import {Member} from './types';

const URL = {
  SOCIAL_SIGNIN: '/tokens/social-oidc',
  GUEST_SIGNIN: '/tokens/guest',
  SIGN_OUT: '/tokens/me',
  CUSTOMER_ME: '/members/me',
};

export const requestSignIn = async (params: {idToken: string | null}) => {
  try {
    const {idToken} = params;
    const {data} = await request<Member>({
      method: 'post',
      url: URL.SOCIAL_SIGNIN,
      requestBody: {idToken},
    });
    return {...data};
  } catch (e: any) {
    if (e?.response?.data) {
      console.log(e.response.data);
      return;
    }
    console.log(e);
  }
};

export const requestSignInAsGuest = async () => {
  try {
    const {data} = await request<Member>({
      method: 'post',
      url: URL.GUEST_SIGNIN,
    });
    return {...data};
  } catch (e: any) {
    if (e?.response?.data) {
      console.log(e.response.data);
      return;
    }
    console.log(e);
  }
};

export const requestSignOut = async () => {
  try {
    await request({
      method: 'delete',
      url: URL.SIGN_OUT,
    });
  } catch (e) {
    // throw getAppError(e as AppError);
  }
};
