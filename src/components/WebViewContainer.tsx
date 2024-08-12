import React, {useEffect, useRef, useState} from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import {AppState, AppStateStatus, Linking, Platform, View} from 'react-native';
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
import DeviceInfo from 'react-native-device-info';
import {requestRenew} from '@/apis/Auth';
import {useSocialSignIn} from '@/hooks/socialSignIn';

export default function WebViewContainer(): React.JSX.Element {
  const [appState, setAppState] = useState(AppState.currentState);

  const userStore = useUserStore(state => state);
  const [uri, navigateTo] = useState(PATH.GAME);

  const webViewRef = useRef<WebView>(null);
  const [topSafeAreaColor, setTopSafeAreaColor] = useState('#FFEDD5');
  const [bottomSafeAreaColor] = useState('#FCF9F7');

  const socialSignIn = useSocialSignIn();

  const onNavigationStateChange = (navState: WebViewNavigation) => {
    const disableUserSelect =
      '* { -webkit-user-select: none; -webkit-touch-callout: none; } input, textarea { -webkit-user-select: initial; } body {-webkit-user-select: none; -webkit-touch-callout: none;}';
    webViewRef.current?.injectJavaScript(`
      (function(){
        var style = document.createElement('style');
        style.innerHTML = '${disableUserSelect}';
        document.getElementsByTagName('head')[0].appendChild(style);
        
        const meta = document.createElement('meta');
        meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        meta.setAttribute('name', 'viewport'); 
        document.getElementsByTagName('head')[0].appendChild(meta);
      })()
    `);
    if (navState.url === PATH.GAME) {
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

  const createCookieScripts = async () => {
    const cookies = await CookieManager.get('https://api.snackga.me/tokens/me');
    return Object.entries(cookies).map(([key, value]) => {
      let cookieString = `${key}=${value.value}; domain=.snackga.me; path=${value.path}`;
      return `document.cookie = "${cookieString}";`;
    });
  };

  const injectedJavaScript = `
    window.addEventListener('loggedOut', () => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'loggedOut',
        })
      );
    });
    window.addEventListener('app-refresh-requested', () => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'app-refresh-requested',
        })
      );
    });
    window.addEventListener('app-oauth-requested', event => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'app-oauth-requested',
          provider: event.detail.provider
        })
      );
    });
  `;

  const onWebViewMessage = async (e: WebViewMessageEvent) => {
    const data = JSON.parse(e.nativeEvent.data);
    if (data.type === 'loggedOut') {
      await CookieManager.clearAll();
      userStore.clear();
    }
    if (data.type === 'app-refresh-requested') {
      try {
        console.log('renew requested from web');
        await requestRenew();
        const scripts = await createCookieScripts();
        scripts.forEach(it => webViewRef.current?.injectJavaScript(it));
        webViewRef.current?.injectJavaScript(
          "dispatchEvent(new CustomEvent('app-refreshed')); true;",
        );
        console.log('renew succeded, event dispatched');
      } catch (error) {
        webViewRef.current?.injectJavaScript(
          "dispatchEvent(new CustomEvent('app-refresh-failed')); true;",
        );
        await CookieManager.clearAll();
        userStore.clear();
      }
    }
    if (data.type === 'app-oauth-requested') {
      try {
        await socialSignIn(data.provider);
        const scripts = await createCookieScripts();
        scripts.forEach(it => webViewRef.current?.injectJavaScript(it));
        webViewRef.current?.injectJavaScript(
          "dispatchEvent(new CustomEvent('app-oauth-succeeded')); true;",
        );
      } catch (error) {
        webViewRef.current?.injectJavaScript(
          "dispatchEvent(new CustomEvent('app-oauth-failed')); true;",
        );
      }
    }
  };

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

  return (
    <SafeAreaProvider>
      <SafeAreaInsetsContext.Consumer>
        {insets => (
          <View style={styles.container}>
            <View
              style={{height: insets?.top, backgroundColor: topSafeAreaColor}}
            />
            <WebView
              userAgent={`SnackgameApp/1.0 (${
                Platform.OS
              } ${DeviceInfo.getSystemVersion()}; ${DeviceInfo.getModel()}) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36`}
              ref={webViewRef}
              source={{uri}}
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
              onNavigationStateChange={onNavigationStateChange}
              onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
              onContentProcessDidTerminate={() => webViewRef.current?.reload()}
              scalesPageToFit={false}
              bounces={true}
              webviewDebuggingEnabled
              onMessage={onWebViewMessage}
              injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
              decelerationRate="normal"
              style={{backgroundColor: topSafeAreaColor}}
              allowsLinkPreview={false}
            />
            <View
              style={[
                {height: insets?.bottom, backgroundColor: bottomSafeAreaColor},
                styles.bottomSafeArea,
              ]}
            />
          </View>
        )}
      </SafeAreaInsetsContext.Consumer>
    </SafeAreaProvider>
  );
}

EStyleSheet.build();
const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  bottom: {
    backgroundColor: '#FCF9F7',
  },
  bottomSafeArea: {
    maxHeight: '1.25rem',
  },
});
