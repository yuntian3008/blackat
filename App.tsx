/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import type { PropsWithChildren } from 'react';
import {
  Alert,
  Button,
  NativeModules,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Introduce from './screens/introduce';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './screens/login';

type SectionProps = PropsWithChildren<{
  title: string;
}>;



const DefaultNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'rgb(255, 255, 255)',
  },
};

const DarkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'rgb(15, 23, 42)',
  },
};

export type RootStackParamList = {
  Introduce: undefined,
  Login: undefined,
};

const Stack = createNativeStackNavigator<RootStackParamList>()

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const { SignalModule } = NativeModules

  const backgroundStyle = "bg-neutral-300 dark:bg-slate-900"

  const clickTest = async () => {
    const result = await SignalModule.generateIdentityKeyPair() as Array<number>;

    Alert.alert("test", result.toString())
    console.log(result)
  }

  const scheme = useColorScheme()


  return (
    <SafeAreaProvider>
      <NavigationContainer theme={ scheme !== 'dark' ? DefaultNavigationTheme : DarkNavigationTheme}>
          <Stack.Navigator>
            <Stack.Screen name='Introduce' component={Introduce} options={{ headerShown: false }} />
            <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
          </Stack.Navigator>            

      </NavigationContainer>
    </SafeAreaProvider>
    // <Introduce/>


  );
}

export default App;
