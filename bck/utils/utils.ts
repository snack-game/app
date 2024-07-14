import { appleAuth } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import {
  getProfile as getKakaoProfile,
  login,
} from '@react-native-seoul/kakao-login';
import { toString } from 'lodash';
import { logger } from '@src/utils';
import { SocialInfo, socialType } from './types';

export const requestKakaoAuthorization = async () => {
  try {
    const kakaoOAuthToken = await login();
    if (kakaoOAuthToken) {
      const profile = await getKakaoProfile();
      const email = 'email' in profile ? profile.email : undefined;
      logger('kakao profile: ', JSON.stringify(profile, null, 2));

      const res = {
        provider: socialType.KAKAO,
        oauthIdToken: toString(kakaoOAuthToken.idToken),
        email,
      } as SocialInfo;
      return res;
    }
    return null;
  } catch (e) {
    logger('kakao error: ', JSON.stringify(e, null, 2));
    return null;
  }
};

export const requestAppleAuthorization = async () => {
  try {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    if (!appleAuthRequestResponse) {
      throw {
        message: '애플 로그인에 실패하였습니다.',
        code: 'Unexpected',
      };
    }

    const appleCredential = auth.AppleAuthProvider.credential(
      appleAuthRequestResponse.identityToken,
      appleAuthRequestResponse.nonce,
    );

    // SAVE NAME
    // const { fullName } = appleAuthRequestResponse;
    // let name = '';
    // if (fullName?.familyName) {
    //   name = fullName.familyName || '';
    //   if (fullName?.givenName) {
    //     name = name.concat('', fullName.givenName);
    //   }
    // } else if (fullName?.givenName) {
    //   name = fullName.givenName;
    // }
    // if (name.length > 0) {
    //   saveAppleName(name);
    // }
    // SAVE NAME

    const result = await auth().signInWithCredential(appleCredential);
    // const pId = appleAuthRequestResponse.user;
    const email =
      (result.additionalUserInfo?.profile?.email as
        | string
        | null
        | undefined) ?? result.user.email;

    logger('APPLE TOKEN: ', appleCredential.token);

    const res = {
      provider: socialType.APPLE,
      oauthIdToken: toString(appleCredential.token),
      email,
    } as SocialInfo;
    return res;
  } catch (e) {
    logger('APPLE ERROR: ', JSON.stringify(e, null, 2));
    return null;
  }
};
