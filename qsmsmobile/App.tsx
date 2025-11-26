import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import './global.css';
import useCachedResources from './hooks/useCachedResources';
import { LoginProvider } from './src/context/LoginContext';
import RootNavigation from './src/navigation/RootNavigation';

const App = () => {

  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  }

  return (
    <LoginProvider>
      <Container>
        <StatusBar style="auto" />
        <RootNavigation />
      </Container>
    </LoginProvider>
  );
};

export default App;

const Container = styled(View)`
  flex: 1;
  background-color: #1d4ae0ff;
`;
