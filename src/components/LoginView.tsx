import React, {useEffect} from 'react';

import {Image, Text, TouchableOpacity, View} from 'react-native';
import {requestSignInAsGuest} from '@/apis/Auth';
import GoogleIcon from '@/assets/google-sign-in-icon.svg';
import KakaoIcon from '@/assets/kakao-sign-in-icon.svg';
import Logo from '@/assets/logo-snackgame-letter.png';
import EStyleSheet from 'react-native-extended-stylesheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  appleAuth,
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import {useUserStore} from '@/store';
import {useSocialSignIn} from '@/hooks/socialSignIn';

function LoginView(): React.JSX.Element {
  const translateY = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });
  const userStore = useUserStore(state => state);
  const socialSignIn = useSocialSignIn();

  const signInAsGuest = async () => {
    const member = await requestSignInAsGuest();
    userStore.saveUser(member);
  };

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, {duration: 1000}),
        withTiming(10, {duration: 1000}),
      ),
      -1,
      true,
    );
  });

  return (
    <View style={styles.background}>
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.logo, animatedStyle]}>
          <Image source={Logo} resizeMode="contain" style={styles.logo} />
        </Animated.View>
      </View>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => socialSignIn('google')}>
          <GoogleIcon style={styles.icon} />
          <Text style={styles.googleButtonText}>구글 로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.kakaoButton}
          onPress={() => socialSignIn('kakao')}>
          <KakaoIcon style={styles.icon} />
          <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
        </TouchableOpacity>
        {appleAuth.isSupported && (
          <AppleButton
            cornerRadius={12}
            onPress={() => socialSignIn('apple')}
            style={styles.appleButton}
          />
        )}
        <Text style={styles.guestButtonText} onPress={signInAsGuest}>
          게스트로 시작하기
        </Text>
      </View>
    </View>
  );
}
EStyleSheet.build();
const styles = EStyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'rgb(255 237 213)',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    alignItems: 'center',
    flex: 1,
    width: '80%',
  },
  container: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginHorizontal: 'auto',
    marginVertical: '3rem',
    alignItems: 'center',
    gap: '.75rem',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '.75rem',
    marginHorizontal: '1rem',
    height: '3rem',
    width: '15rem',
    gap: '.25rem',
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE500',
    borderRadius: '.75rem',
    marginHorizontal: '1rem',
    height: '3rem',
    width: '15rem',
    gap: '.25rem',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '.75rem',
    marginHorizontal: '1rem',
    height: '3rem',
    width: '15rem',
  },
  icon: {
    flex: 1,
  },
  googleButtonText: {
    color: 'rgb(107 114 128)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  kakaoButtonText: {
    color: '#3c1e1e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestButtonText: {
    color: 'rgb(156 163 175)',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginView;
