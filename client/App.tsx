/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  DarkTheme as DarkNavigationTheme,
  DefaultTheme as LightNavigationTheme,
  LinkingOptions,
  NavigationContainer
} from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  BackHandler,
  DevSettings,
  Linking,
  LogBox,
  NativeEventEmitter,
  NativeModules,
  ToastAndroid,
  useColorScheme,
} from 'react-native';
import { Provider as ReduxProvider } from 'react-redux'

import Introduce from './screens/introduce';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './screens/login';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { default as MyBrandTheme } from './custom-theme.json'
import Home from './screens/home';
import Splash from './screens/splash';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import VerifyOtpCode from './screens/login/verify';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, adaptNavigationTheme, useTheme } from 'react-native-paper';
import { AppTheme, darkTheme, lightTheme } from './theme';
import Search from './screens/search';
import Header, { HeaderItems, MenuItems } from './components/Header';
import NewContact from './screens/newcontact';
import ChatZone from './screens/chatzone';
import socket from './utils/socket';
import DeviceInfo from 'react-native-device-info';
import { App as AppTypes, BundleRequirement, LoggedInfo, Server, Signal, SocketEvent, SignalError } from '../shared/types';
import SignalModule from './native/android/SignalModule';
import store from './store';
import { useAppDispatch, useAppSelector } from './hooks';
import { setConversationData } from './redux/ConversationWithMessages';
import { da } from 'date-fns/locale';
import AppModule from './native/android/AppModule';
import { format, formatISO } from 'date-fns';
import Log from './utils/Log';
import ImageView from './screens/imageview';
import { connected, disconnected } from './redux/SocketConnection';
import { TopToast, TopToastType } from './components/TopToast';
import { enqueueTopToast } from './redux/TopToast';
import { useNetInfo } from '@react-native-community/netinfo';
import { onBundleRequire, onNewMessage, prepareMessaging } from './utils/Messaging';
import messaging from '@react-native-firebase/messaging'
import notifee, { EventType } from '@notifee/react-native';
import Partner from './screens/partner';
import Qrscanner from './screens/qrscanner';
import Setting from './screens/setting';
import { HomeProps } from './screens';
import Account from './screens/account';
import Profile from './screens/profile';
import ChatSetting from './screens/chatsetting';



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
    e164: string
  },
  ImageView: {
    uri: string,
  },
  Setting: undefined,
  Account: undefined,
  Profile: undefined
  Partner: {
    partner: AppTypes.Types.Partner,
  },
  Qrscanner: {
    input?: any,
  },
  ChatSetting: {
    conversation: AppTypes.Types.Conversation,
  }
  
};

const deepLinksConf = {
  
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['blackat://', 'https://app.blackat.cielot.com'],
  config: {
    screens: {
      ChatZone: 'chatzone/:e164'
    }
  },
  getInitialURL: async () => {

    const url = await Linking.getInitialURL();

    if (url != null) {
      return url
    }

    const message = await notifee.getInitialNotification()
    const link = message?.notification.data?.link as string | undefined
    return link
  },
  subscribe: (listener) => {
    const onReceiveURL = ({url}: {url: string}) => listener(url);

    // Listen to incoming links from deep linking
    Linking.addEventListener('url', onReceiveURL);

    const unsubscribeNotification = notifee.onForegroundEvent(({ type, detail}) => {
      if (type == EventType.PRESS) {
        const url = detail.notification?.data?.link as string | undefined

        if (url)
          listener(url)
      }
    })

    return () => {
      Linking.removeAllListeners('url')
      unsubscribeNotification()
    }
  }
}


const Stack = createStackNavigator<RootStackParamList>()

function App(): JSX.Element {
  const schema = useColorScheme()
  const theme = useTheme<AppTheme>()

  // Set an initializing state whilst Firebase connects
  // const [isConnected, setIsConnected] = useState(socket.connected);
  const [authStateInitializing, setAuthStateInitializing] = useState(true);
  const [socketInitializing, setSocketInitializing] = useState(true);
  const [databaseInitializing, setDatabaseInitializing] = useState(true)
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [splashOpening, setSplashOpening] = useState(true)

  const [test, setTest] = useState<number>(0)

  const conversationData = useAppSelector(state => state.conversationData.value)
  const socketConnection = useAppSelector(state => state.socketConnection.value)
  const dispatch = useAppDispatch()

  // const appState = useRef(AppState.currentState);
  // useEffect(() => {
  //   const unsubscribe = AppState.addEventListener('change',(state) => {
  //     if (
  //       appState.current.match(/inactive|background/) &&
  //       state == 'active'
  //     ) {
  //     }
  //     else {
  //       socket.disconnect()
  //     }

  //     appState.current = state
  //   })

  //   return () => {
  //     unsubscribe.remove()
  //   }
  // })

  // FLOW DATABASE CHANGED
  useEffect(() => {
    const conversationWithMessageChanged = (data: Array<AppTypes.Types.ConversationWithMessages>) => {
      dispatch(setConversationData(data))
      // console.log(data)
      setDatabaseInitializing(false)
    }
    const eventEmiter = new NativeEventEmitter(NativeModules.AppModule)
    const eventListener = eventEmiter.addListener('conversationWithMessageChanged', conversationWithMessageChanged)
    // console.log("Đang lắng nghe")
    return () => {
      eventListener.remove()
    }
  })

  // FLOW AUTHENTICATION STATE
  useEffect(() => {
    const login = async () => {
      try {
        const idToken = await user!.getIdToken()
        const registrationId = await SignalModule.requireRegistrationId()

        await messaging().registerDeviceForRemoteMessages()
        const fcmToken = await messaging().getToken()

        socket.auth = {
          token: idToken,
          registrationId: registrationId,
          fcmToken: fcmToken
        }
        socket.connect()
      } catch (e) {
        console.log(e)
      }

    }
    if (user && !socketConnection) {
      // ToastAndroid.show('Đã đăng nhập đang kết nối máy chủ', ToastAndroid.SHORT)
      login()
    }
    // if (!user && socketConnection) {
    //   socket.emit('logout')
    //   // SignalModule.logout()
    //   // BackHandler.exitApp()
    // }

  }, [user])

  const netInfo = useNetInfo()
  const [justOffline, setJustOffline] = useState<boolean>(false)

  // FLOW INTERNET STATE
  useEffect(() => {
    console.log(netInfo.isConnected)
    if (netInfo.isConnected === false) {
      setJustOffline(true)
      dispatch(enqueueTopToast({
        content: "Bạn đang ngoại tuyến",
        duration: 10000,
        type: TopToastType.error
      }))
    }
    if (justOffline && netInfo.isConnected) {
      setJustOffline(false)
      dispatch(enqueueTopToast({
        content: "Bạn đã trực tuyến trở lại",
        duration: 3000,
        type: TopToastType.success
      }))
    }

  }, [netInfo.isConnected])

  // SOCKET LISTENER
  useEffect(() => {
    function onConnect() {
      console.log('Đã kết nối máy chủ')
      dispatch(connected())
      prepareMessaging().then(() => {
        socket.emit('online')
      }).catch((e) => {
        Log("PREPARE MESSESIGN ISSUE")
        Log(e)
      })
    }

    function onDisconnect() {
      dispatch(disconnected())
    }

    function onConnectError(err: Error) {
      dispatch(disconnected())
    }

    function onLogged(info: LoggedInfo) {
      SignalModule.logged(info.e164, info.deviceId)
    }

    console.log("on socket")
    socket.on('requireBundle', onBundleRequire)
    socket.on('logged', onLogged)
    socket.on("connect_error", onConnectError);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('newMessage',onNewMessage);
    // socket.on('inComingMessage', inComingMessage)
    // socket.on("sendMailbox", onMailBox)

    return () => {
      console.log("off socket")
      socket.off('requireBundle', onBundleRequire)
      socket.off('logged', onLogged)
      socket.off('connect_error', onConnectError);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('newMessage',onNewMessage)
      // socket.off('inComingMessage', inComingMessage)
      // socket.off("sendMailbox", onMailBox)

    };
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (authStateInitializing) setAuthStateInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);




  if (authStateInitializing || databaseInitializing || splashOpening /*|| (user && !socketConnection && needServer) */) {
    return (<Splash onAnimationFinished={() => setSplashOpening(false)} />);
  }


  return (
    <>
      {/* <ApplicationProvider {...eva} theme={{ ...eva.light, ...MyBrandTheme }}> */}
        <SafeAreaProvider>
          {/* <NavigationContainer theme={scheme !== 'dark' ? DefaultNavigationTheme : DarkNavigationTheme}> */}
          <TopToast />
          <NavigationContainer linking={linking} theme={schema === 'dark' ? DarkTheme : LightTheme}>
            <Stack.Navigator>
              {(!user) ? (
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
                <>
                  <Stack.Group screenOptions={{ headerShown: false }}>
                    <Stack.Screen name='Home' component={Home} options={({ navigation }: HomeProps) => ({
                      headerShown: true,
                      title: "Blackat",
                      headerRight: () => {
                        const menuItems: MenuItems[] = [
                          
                          {
                            icon: 'cog-outline',
                            label: "Cài đặt",
                            onPress: () => {
                              navigation.navigate('Setting')
                            }
                          },
                          // {
                          //   label: "test",
                          //   onPress: () => {
                          //     SignalModule.testPerformance().then((result) => {
                          //       Alert.alert("RESULT", result)
                          //     })
                          //   }
                          // },
                        ]
                        const headerItems: HeaderItems[] = [
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
                    <Stack.Screen name='Qrscanner' component={Qrscanner} />
                    <Stack.Screen name='Setting' component={Setting} options={{
                      headerStyle: {
                        backgroundColor: theme.colors.background
                      },
                      title: 'Cài đặt',
                      headerShown: true,
                    }} />
                    <Stack.Screen name='Account' component={Account} options={{
                      headerStyle: {
                        backgroundColor: theme.colors.background
                      },
                      title: 'Tài khoản',
                      headerShown: true,
                    }} />
                    <Stack.Screen name='Profile' component={Profile} options={{
                      headerStyle: {
                        backgroundColor: theme.colors.background
                      },
                      title: 'Hồ sơ',
                      headerShown: true,
                    }} />
                    <Stack.Screen name='Partner' component={Partner} options={{
                      headerShown: true,
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
                    }}
                    />
                    <Stack.Screen name='ChatSetting' component={ChatSetting} options={{
                      headerShown: true,
                      title: "Cài đặt cuộc trò chuyện"
                    }}
                    />
                  </Stack.Group>
                  <Stack.Group screenOptions={{ headerShown: true, presentation: 'modal' }}>
                    <Stack.Screen name="ImageView" component={ImageView} options={{
                      headerStyle: {
                        backgroundColor: 'black'
                      },
                      headerTintColor: '#f1f1f1',
                      title: 'Hình ảnh'
                    }} />
                  </Stack.Group>
                </>

              )
              }
            </Stack.Navigator>

          </NavigationContainer>


        </SafeAreaProvider>
      {/* </ApplicationProvider> */}
    </>
  );
}

export default App;
