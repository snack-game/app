import React from 'react';

import WebViewContainer from './src/components/WebViewContainer';
import {SafeAreaProvider} from 'react-native-safe-area-context';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <WebViewContainer />
    </SafeAreaProvider>
  );
}

export default App;
