import { appleAuth } from '@invertase/react-native-apple-authentication';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login } from '@react-native-seoul/kakao-login';
import { requestSignIn } from '@/apis/Auth';
import { useUserStore } from '@/store';

type Provider = 'google' | 'kakao' | 'apple';

export const useSocialSignIn = () => {
  const userStore = useUserStore(state => state);

  const signInWithGoogle = async () => {
    GoogleSignin.configure({
      webClientId:
        '487046925377-u8l39aus52uhrctl0lti5oq8hld612kj.apps.googleusercontent.com',
      iosClientId:
        '487046925377-spdjmn3ie7pnotp1orccp7becuf5d68g.apps.googleusercontent.com',
    });
    await GoogleSignin.hasPlayServices();
    try {
      const userInfo = await GoogleSignin.signIn();
      const member = await requestSignIn(userInfo);
      userStore.saveUser(member);
    }
    catch (err) {
      console.error(err);
      throw err;
    }
  };
  const signInWithKakao = async () => {
    try {
      const token = await login();
      const member = await requestSignIn(token);
      userStore.saveUser(member);
    } catch (err) {
      console.error('Login Failed:', err);
      throw err;
    }
  };

  const signInWithApple = async () => {
    const response = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    const { identityToken } = response;
    const member = await requestSignIn({ idToken: identityToken });
    userStore.saveUser(member);
  };

  const handlerMappings: Map<Provider, () => Promise<void>> = new Map([
    ['google', signInWithGoogle],
    ['kakao', signInWithKakao],
    ['apple', signInWithApple],
  ]);

  return async (provider: Provider) => {
    const handler = handlerMappings.get(provider)!;
    await handler();
  };
};
