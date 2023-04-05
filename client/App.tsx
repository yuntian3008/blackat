/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  DarkTheme as DarkNavigationTheme,
  DefaultTheme as LightNavigationTheme,
  NavigationContainer
} from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ToastAndroid,
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
import VerifyOtpCode from './screens/login/verify';
import { createStackNavigator } from '@react-navigation/stack';
import { adaptNavigationTheme } from 'react-native-paper';
import { darkTheme, lightTheme } from './theme';
import Search from './screens/search';
import Header, { HeaderItems, MenuItems } from './components/Header';
import NewContact from './screens/newcontact';
import ChatZone from './screens/chatzone';
import socket from './utils/socket';
import DeviceInfo from 'react-native-device-info';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: LightNavigationTheme,
  materialLight: lightTheme,
  reactNavigationDark: DarkNavigationTheme,
  materialDark: darkTheme
});


export type RootStackParamList = {
  Introduce: undefined,
  Login: undefined,
  Home: undefined,
  VerifyOtpCode: {
    phoneNumber: string,
    verificationId: string
  },
  Search: undefined,
  NewContact: undefined,
  ChatZone: {
    conversationName: string
  },
};


const Stack = createStackNavigator<RootStackParamList>()

function App(): JSX.Element {
  const schema = useColorScheme()

  // Set an initializing state whilst Firebase connects
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [authStateInitializing, setAuthStateInitializing] = useState(true);
  const [socketInitializing, setSocketInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [splashOpening, setSplashOpening] = useState(true)

  useEffect(() => {
    const login = async () => {
      const idToken = await user!.getIdToken()
      const uniqueId = await DeviceInfo.getUniqueId()

      socket.auth = {
        token: idToken,
        deviceUniqueId: uniqueId
      }
      socket.connect()
    }
    if(user && !isConnected) {
      ToastAndroid.show('Đã đăng nhập đang kết nối máy chủ', ToastAndroid.SHORT)
      login()
    }
    if (!user && isConnected) {
      socket.emit('logout')
    }
  }, [user])

  useEffect(() => {

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onConnectError(err: Error) {
      switch(err.message) {
        case "timeout":
          Alert.alert("Lỗi","Không thể kết nối với máy chủ")
          break
      }
      
    }

    socket.on("connect_error", onConnectError);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect_error', onConnectError);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      
    };
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (authStateInitializing) setAuthStateInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  // const { SignalModule } = NativeModules

  // const clickTest = async () => {
  //   const result = await SignalModule.generateIdentityKeyPair() as Array<number>;

  //   Alert.alert("test", result.toString())
  //   console.log(result)
  // }

  const needServer = false

  if (authStateInitializing || splashOpening || (user && !isConnected && needServer)) {
    return (<Splash onAnimationFinished={() => setSplashOpening(false)} />);
  }


  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{ ...eva.light, ...MyBrandTheme }}>
        <SafeAreaProvider>
          {/* <NavigationContainer theme={scheme !== 'dark' ? DefaultNavigationTheme : DarkNavigationTheme}> */}
          <NavigationContainer theme={schema === 'dark' ? DarkTheme : LightTheme}>
            <Stack.Navigator>
              { (!isConnected && needServer) ? (
                <Stack.Group screenOptions={{ headerShown: false }}>
                  <Stack.Screen name='Introduce' component={Introduce} />
                  <Stack.Screen name='Login' component={Login} />
                  <Stack.Screen name='VerifyOtpCode' component={VerifyOtpCode}
                    options={{
                      presentation: 'modal',
                      headerShown: true,
                      title: 'Xác thực số điện thoại'
                    }} />

                </Stack.Group>

              ) : (
                <Stack.Group screenOptions={{ headerShown: false }}>
                  <Stack.Screen name='Home' component={Home} options={({ navigation }) => ({
                    headerShown: true,
                    title: "Blackat",
                    headerRight: () => {
                      const menuItems: MenuItems[] = [
                        {
                          label: "Cài đặt",
                          onPress: () => {
                            Alert.alert('Cài đặt')
                          }
                        },
                        {
                          label: "Đăng xuất",
                          onPress: () => {
                            auth()
                              .signOut()
                              .then(() => console.log('User signed out!'));
                          }
                        },
                      ]
                      const headerItems: HeaderItems[] = [
                        // {
                        //   label: "magnify",
                        //   onPress: () => navigation.navigate('Search')
                        // },
                        {
                          label: "dots-vertical",
                          items: menuItems
                        }
                      ]
                      return (
                        <Header items={headerItems} />
                      )
                    }
                  })} />
                  <Stack.Screen name='Search' component={Search} options={{
                    headerShown: true,
                    title: "Tìm kiếm"
                  }} />
                  <Stack.Screen name='NewContact' component={NewContact} options={{
                    headerShown: true,
                    presentation: 'modal',
                    title: "Chọn người nhắn tin"
                  }} />
                  <Stack.Screen name='ChatZone' component={ChatZone} options={{
                    headerShown: true,
                    presentation: 'modal',
                    title: "Chọn người nhắn tin"
                  }} />
                </Stack.Group>
              )
              }
            </Stack.Navigator>

          </NavigationContainer>
        </SafeAreaProvider>
      </ApplicationProvider>
    </>
  );
}

export default App;
