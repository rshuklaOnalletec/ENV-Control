import React from 'react';
import { StatusBar } from 'react-native';
import { Colors } from './src/theme';

const App: React.FC = () => {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryDark}
      />
    </>
  );
};

export default App;
