/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Alert,
  NativeModules,
  useColorScheme,
} from 'react-native';

import Introduce from './screens/introduce';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './screens/login';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { default as MyBrandTheme } from './custom-theme.json'
import Home from './screens/home';
import Splash from './screens/splash';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';


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
  Home: undefined
  Splash: {
    onReady: () => void
  }
};

const Stack = createNativeStackNavigator<RootStackParamList>()

function App(): JSX.Element {

  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [splashOpening, setSplashOpening] = useState(true)

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  // const { SignalModule } = NativeModules

  // const clickTest = async () => {
  //   const result = await SignalModule.generateIdentityKeyPair() as Array<number>;

  //   Alert.alert("test", result.toString())
  //   console.log(result)
  // }

  if (initializing || splashOpening) {
    return (<Splash onAnimationFinished={() => setSplashOpening(false)} />);
  }


  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{ ...eva.light, ...MyBrandTheme }}>
        <SafeAreaProvider>
          {/* <NavigationContainer theme={scheme !== 'dark' ? DefaultNavigationTheme : DarkNavigationTheme}> */}
          <NavigationContainer>
            <Stack.Navigator>
              {!user ? (
                <>
                  <Stack.Screen name='Introduce' component={Introduce} options={{ headerShown: false }} />
                  <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
                </>

              ) : (
                <>
                  <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
                </>
              )}

              <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
            </Stack.Navigator>

          </NavigationContainer>
        </SafeAreaProvider>
      </ApplicationProvider>
    </>
  );
}

export default App;
