import { HttpMethod } from './../../networks/types';
import { request } from '@/networks';
import { Member } from './types';

interface ApiEndpoint {
  method: HttpMethod;
  url: string;
}
const SOCIAL_SIGNIN: ApiEndpoint = { method: 'post', url: '/tokens/social-oidc' };
const GUEST_SIGNIN: ApiEndpoint = { method: 'post', url: '/tokens/guest' };
const SIGN_OUT: ApiEndpoint = { method: 'delete', url: '/tokens/me' };
const RENEW: ApiEndpoint = { method: 'patch', url: '/tokens/me' };
const ME: ApiEndpoint = { method: 'get', url: '/members/me' };

const REGISTER_DEVICE: ApiEndpoint = { method: 'post', url: '/notifications/devices' };

export const requestSignIn = async (params: { idToken: string | null }) => {
  try {
    const { idToken } = params;
    const { data } = await request<Member>({
      requestBody: { idToken },
      ...SOCIAL_SIGNIN,
    });
    return { ...data };
  } catch (e: any) {
    if (e?.response?.data) {
      console.log('error response:', e.response.data);
      return;
    }
  }
};

export const requestSignInAsGuest = async () => {
  try {
    const { data } = await request<Member>({
      ...GUEST_SIGNIN,
    });
    return { ...data };
  } catch (e: any) {
    if (e?.response?.data) {
      console.log('error response:', e.response.data);
      return;
    }
  }
};

export const requestSignOut = async () => {
  try {
    await request({
      ...SIGN_OUT,
    });
  } catch (e: any) {
    if (e?.response?.data) {
      console.log('error response:', e.response.data);
      return;
    }
  }
};

export const requestRenew = async () => {
  try {
    await request({
      ...RENEW,
    });
  } catch (e: any) {
    if (e?.response?.data) {
      console.log('error response:', e.response.data);
      return;
    }
  }
};

export const requestMemberDetails = async () => {
  try {
    const { data } = await request<Member>({
      ...ME,
    });
    return data;
  } catch (e: any) {
    if (e?.response?.data) {
      console.log('error response:', e.response.data);
      return;
    }
  }
};

export const requestDeviceRegister = async (deviceTokenRequest: {token: string}) => {
  try {
    await request<void>({
      ...REGISTER_DEVICE,
      requestBody: deviceTokenRequest
    });
  } catch (e: any) {
    if (e?.response?.data) {
      console.log('error response:', e.response.data);
      return;
    }
  }
};
