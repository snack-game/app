import React, {useRef, useState} from 'react';
import {Dimensions, Linking, StyleSheet} from 'react-native';
import WebView, {WebViewNavigation} from 'react-native-webview';
import {PATH} from './constants/path.constants';
import {SafeAreaView} from 'react-native-safe-area-context';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function WebViewContainer(): React.JSX.Element {
  const uri = PATH.GAME;
  const webViewRef = useRef<WebView>(null);
  const [statusBarColor, setStatusBarColor] = useState<string>('#FFEDD5');

  const onNavigationStateChange = (navState: WebViewNavigation) => {
    if (navState.url === PATH.AUTH || navState.url === PATH.GAME) {
      setStatusBarColor('#FFEDD5');
    } else {
      setStatusBarColor('#FCF9F7');
    }
  };

  const onShouldStartLoadWithRequest = (navState: WebViewNavigation) => {
    if (uri && !navState.url.includes(uri)) {
      Linking.openURL(navState.url);
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{
        ...styles.container,
        backgroundColor: statusBarColor,
      }}>
      <WebView
        style={styles.webview}
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
  },
});
