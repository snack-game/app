import React, {useRef} from 'react';
import {Dimensions, Linking, StyleSheet} from 'react-native';
import WebView, {WebViewNavigation} from 'react-native-webview';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function WebViewContainer(): React.JSX.Element {
  const uri = 'https://dev.snackga.me/auth';
  const webViewRef = useRef<WebView>(null);

  const onShouldStartLoadWithRequest = (navState: WebViewNavigation) => {
    if (uri && !navState.url.includes(uri)) {
      Linking.openURL(navState.url);
      return false;
    }
    return true;
  };

  return (
    <>
      <WebView
        style={styles.webview}
        ref={webViewRef}
        originWhitelist={['*']}
        source={{uri}}
        thirdPartyCookiesEnabled={true}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onContentProcessDidTerminate={() => webViewRef.current?.reload()}
        scalesPageToFit={true}
        bounces={false}
        webviewDebuggingEnabled
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webview: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
  },
});
