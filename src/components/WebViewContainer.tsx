import React, {useEffect, useRef, useState} from 'react';
import {
  AppState,
  AppStateStatus,
  Button,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import WebView, {
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview';
import {PATH} from './constants/path.constants';
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import {useUserStore} from '@/store';
import CookieManager from '@react-native-cookies/cookies';

export default function WebViewContainer(): React.JSX.Element {
  const [appState, setAppState] = useState(AppState.currentState);

  const userStore = useUserStore(state => state);
  const [uri] = useState('https://dev.snackga.me/snack-game');

  const webViewRef = useRef<WebView>(null);
  const [topSafeAreaColor, setTopSafeAreaColor] = useState('#FFEDD5');
  const [bottomSafeAreaColor] = useState('#FCF9F7');

  const onNavigationStateChange = (navState: WebViewNavigation) => {
    if (navState.url === PATH.AUTH || navState.url === PATH.GAME) {
      setTopSafeAreaColor('#FFEDD5');
    } else {
      setTopSafeAreaColor('#FCF9F7');
    }
  };

  const onShouldStartLoadWithRequest = (navState: WebViewNavigation) => {
    if (uri && !navState.url.includes(uri)) {
      Linking.openURL(navState.url);
      return false;
    }
    return true;
  };

  const onMessage = async (e: WebViewMessageEvent) => {
    const data = JSON.parse(e.nativeEvent.data);
    if (data.type === 'loggedOut') {
      console.log('loggedOut');
      await CookieManager.clearAll();
      userStore.clearUser();
    }
  };

  const injectedJavaScript = `
    window.addEventListener('loggedOut', ()=>{
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'loggedOut',
        })
      );
    });
  `;

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        webViewRef?.current?.postMessage(
          JSON.stringify({event: 'app-foreground'}),
        );
      }
      if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        console.log('App has gone to the background!');
        webViewRef?.current?.postMessage(
          JSON.stringify({event: 'app-background'}),
        );
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [appState]);

  useEffect(() => {
    (async () => {
      await CookieManager.setFromResponse(
        'https://dev-api.snackga.me',
        userStore.cookie![0],
      );
    })();
  }, [userStore]);

  return (
    <SafeAreaProvider>
      <SafeAreaInsetsContext.Consumer>
        {insets => (
          <View style={styles.container}>
            <View
              style={{height: insets?.top, backgroundColor: topSafeAreaColor}}
            />
            <WebView
              userAgent="SnackgameApp"
              ref={webViewRef}
              originWhitelist={['*']}
              source={{uri}}
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
              onNavigationStateChange={onNavigationStateChange}
              onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
              onContentProcessDidTerminate={() => webViewRef.current?.reload()}
              scalesPageToFit={true}
              bounces={false}
              webviewDebuggingEnabled
              onMessage={onMessage}
              injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
              decelerationRate={0.99}
            />
            <View
              style={{
                height: insets?.bottom,
                backgroundColor: bottomSafeAreaColor,
              }}
            />
          </View>
        )}
      </SafeAreaInsetsContext.Consumer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottom: {
    backgroundColor: '#FCF9F7',
  },
});
