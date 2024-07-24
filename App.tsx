import React, {useEffect} from 'react';

import {View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {useUserStore} from '@/store';
import LoginView from '@/components/LoginView';
import WebViewContainer from '@/components/WebViewContainer';
import {requestMemberDetails} from '@/apis/Auth';

function App(): React.JSX.Element {
  const userStore = useUserStore(state => state);

  // const loadCookies = async () => {
  //   const cookiesString = await AsyncStorage.getItem('cookies');
  //   if (cookiesString) {
  //     const cookies: Cookies = JSON.parse(cookiesString);
  //     for (const [name, value] of Object.entries(cookies)) {
  //       // console.error(name, value.value);
  //       await CookieManager.set('https://dev-api.snackga.me/', {
  //         name,
  //         value: value.value,
  //         domain: value.domain,
  //         path: value.path,
  //         version: value.version,
  //         expires: value.expires,
  //         httpOnly: value.httpOnly,
  //         secure: value.secure,
  //       });
  //     }
  //   }
  // };

  useEffect(() => {
    // AsyncStorage.clear();
    // CookieManager.clearAll();
    (async () => {
      if (userStore.user) {
        const member = await requestMemberDetails();
        if (member) {
          userStore.saveUser(member);
        }
      }
    })();
  }, []);

  return (
    <View style={styles.background}>
      {!userStore.user ? <LoginView /> : <WebViewContainer />}
      {/* <Button
        title="req"
        onPress={async () => {
          await requestMemberDetails();
        }}
      />
      <Button
        title="remove cookies"
        onPress={async () => {
          await CookieManager.clearAll();
        }}
      /> */}
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
