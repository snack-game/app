import React, { useEffect } from 'react';

import { Alert, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useUserStore } from '@/store';
import LoginView from '@/components/LoginView';
import WebViewContainer from '@/components/WebViewContainer';
import { requestDeviceRegister, requestMemberDetails } from '@/apis/Auth';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid } from 'react-native';
import displayNotification from '@/utils/localNotification';

function App(): React.JSX.Element {
  const userStore = useUserStore(state => state);

  let initialMemberRetrieval: Promise<void>;

  async function registerDeviceIfAvailable() {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }

    await initialMemberRetrieval;

    const token = await messaging().getToken();
    requestDeviceRegister({ token });
  }

  async function retrieveMember() {
    if (userStore.user) {
      const member = await requestMemberDetails();
      if (member) {
        userStore.saveUser(member);
      }
    }
  }

  useEffect(() => {
    initialMemberRetrieval = retrieveMember();
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    messaging().requestPermission();
  }, []);

  useEffect(() => {
    const messageHandler = messaging().onMessage(async remoteMessage => {
      console.log(remoteMessage);
      displayNotification(remoteMessage);
    });

    return messageHandler;
  }, []);

  useEffect(() => {
    registerDeviceIfAvailable()
  }, [userStore.user]);

  return (
    <View style={styles.background}>
      {!userStore.user ? <LoginView /> : <WebViewContainer />}
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
    width: '60%',
  },
});

export default App;
