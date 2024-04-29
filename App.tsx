import React from 'react';

import WebViewContainer from './src/components/WebViewContainer';
import {SafeAreaView, StyleSheet} from 'react-native';

function App(): React.JSX.Element {
  return (
    <>
      <SafeAreaView style={styles.container}>
        <WebViewContainer />
      </SafeAreaView>
    </>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFEDD5',
  },
});
