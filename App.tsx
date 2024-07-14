import React from 'react';

import {View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {useUserStore} from '@/store';
import LoginView from '@/components/LoginView';
import WebViewContainer from '@/components/WebViewContainer';

function App(): React.JSX.Element {
  const cookie = useUserStore(state => state.cookie);

  return (
    <View style={styles.background}>
      {!cookie ? <LoginView /> : <WebViewContainer />}
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
