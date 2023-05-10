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
  BackHandler,
  DevSettings,
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
import socket, { outGoingMessage } from './utils/socket';
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
import { TopToast } from './components/TopToast';
import { showTopToast } from './redux/TopToast';
import { useNetInfo } from '@react-native-community/netinfo';

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
  }
};

const emitUploadIdentityKey = (identityKey: Signal.Types.IdentityKey) => {
  return new Promise<boolean>((resolve) => {
    socket.emit('uploadIdentityKey', identityKey, function (result) {
      resolve(result)
    })
  })
}



const emitUploadSignedPreKey = (signedPreKey: Signal.Types.SignedPreKey) => {
  return new Promise<boolean>((resolve) => {
    socket.emit('uploadSignedPreKey', signedPreKey, function (result) {
      resolve(result)
    })
  })
}

const emitUploadPreKeys = (preKeys: Array<Signal.Types.PreKey>) => {
  return new Promise<boolean>((resolve) => {
    socket.emit('uploadPreKeys', preKeys, function (result) {
      resolve(result)
    })
  })
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


  useEffect(() => {
    const conversationWithMessageChanged = (data: Array<AppTypes.Types.ConversationWithMessages>) => {
      dispatch(setConversationData(data))
      setDatabaseInitializing(false)
      // console.log("Đã flow dữ liệu database")
      // console.log(data)
      // console.log(conversationData)
    }
    const eventEmiter = new NativeEventEmitter(NativeModules.AppModule)
    const eventListener = eventEmiter.addListener('conversationWithMessageChanged', conversationWithMessageChanged)
    // console.log("Đang lắng nghe")
    return () => {
      eventListener.remove()
    }
  })

  useEffect(() => {
    const login = async () => {
      try {
        const idToken = await user!.getIdToken()
        const registrationId = await SignalModule.requireRegistrationId()

        socket.auth = {
          token: idToken,
          registrationId: registrationId
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
    if (!user && socketConnection) {
      socket.emit('logout')
    }

  }, [user])

  const netInfo = useNetInfo()
  useEffect(() => {
    if (!netInfo.isConnected) {
      dispatch(showTopToast({
        content: "Không có kết nối internet",
        duration: 10000
      }))
    }
  }, [netInfo.isConnected])

  useEffect(() => {
    const handleBundleRequire = async (requirement: BundleRequirement): Promise<boolean> => {
      try {
        let resultIdentityKey = true;
        let resultSignedPreKey = true;
        let resultPreKey = true;
        if (requirement.needIdentityKey) {
          const identityKey = await SignalModule.requireIdentityKey()
          resultIdentityKey = await emitUploadIdentityKey(identityKey)
        }
        if (requirement.needSignedPreKey) {
          const signedPreKey = await SignalModule.requireSignedPreKey()
          resultSignedPreKey = await emitUploadSignedPreKey(signedPreKey)
        }
        if (requirement.needPreKeys) {
          const preKeys = await SignalModule.requireOneTimePreKey()
          resultPreKey = await emitUploadPreKeys(preKeys)
        }
        return resultIdentityKey && resultPreKey && resultSignedPreKey
      } catch (e) {
        console.log(e)
        return false
      }

    }

    function onConnect() {
      console.log('Đã kết nối máy chủ')
      dispatch(connected)
      // setIsConnected(true);
    }

    function onDisconnect() {
      dispatch(disconnected)
      // setIsConnected(false);
    }

    function onConnectError(err: Error) {
      dispatch(disconnected)
      // setIsConnected(false);
      console.log(err.message)
      if (err.message === "timeout")
        dispatch(showTopToast({ content: "Máy chủ không phản hồi" }))
    }

    function onLogged(info: LoggedInfo) {
      SignalModule.logged(info.e164, info.deviceId)
    }


    function onBundleRequire(requirement: BundleRequirement) {
      if (requirement.needIdentityKey || requirement.needPreKeys || requirement.needSignedPreKey)
        ToastAndroid.show("Máy chủ thiếu một só khóa và yêu cầu cung cấp khóa chúng", ToastAndroid.SHORT)
      handleBundleRequire(requirement).then((v) => {

        if (!v) {
          ToastAndroid.show("Cung cấp khóa cho máy chủ không thành công", ToastAndroid.SHORT)
          BackHandler.exitApp()
        }
        else ToastAndroid.show("Cung cấp khóa cho máy chủ thành công", ToastAndroid.SHORT)
      })
    }

    const saveMessageToLocal = async (sender: Signal.Types.SignalProtocolAddress, message: Server.Message): Promise<void> => {
      try {
        let plainText
        if (message.fileInfo !== undefined) {
          console.log("Nhan dc anh dang decrypt")
          plainText = await SignalModule.decryptFile(sender, message.data, message.fileInfo, false)
        }
        else
          plainText = await SignalModule.decrypt(sender, message.data, false)
        if (plainText === null) {
          Log("GHI FILE THẤT BẠI")
          ToastAndroid.show('GHI FILE THẤT BẠI', ToastAndroid.SHORT)
          return
        }
        if (typeof plainText !== "string") {
          const error = (plainText as SignalError)
          if (error.code == "need-encrypt") {
            const localAddress = await SignalModule.requireLocalAddress()
            const emptyCipher = await SignalModule.encrypt(sender, "")
            const emptyMessage: Server.Message = {
              data: {
                cipher: emptyCipher.cipher,
                type: emptyCipher.type
              },
              type: AppTypes.MessageType.EMPTY,
              timestamp: formatISO(new Date())
            }

            const result = await outGoingMessage(localAddress, sender, emptyMessage)
            if (message.fileInfo !== undefined) {
              plainText = await SignalModule.decryptFile(sender, message.data, message.fileInfo, true)
            }
            else
              plainText = await SignalModule.decrypt(sender, message.data, true)
            if (typeof plainText !== "string") throw new Error("cannot-encrypt")
          }
        }
        if (message.type == AppTypes.MessageType.EMPTY) return;
        await AppModule.saveMessage(sender.e164, {
          data: plainText as string,
          owner: AppTypes.MessageOwner.PARTNER,
          timestamp: message.timestamp,
          type: message.type
        })
      } catch (e) { console.log(e) }
    }

    const inComingMessage = (sender: Signal.Types.SignalProtocolAddress, message: Server.Message, callback: (inComingMessageResult: SocketEvent.InComingMessageResult) => void) => {
      Log(`Có tin nhắn mới từ ${sender.e164}`)
      Log(message)
      saveMessageToLocal(sender, message).then(() => {
        callback({
          isProcessed: true
        })
      }).catch((e) => {
        console.log("Bắt đc nè")
        console.log(e)
        callback({
          isProcessed: false
        })
      })
    }

    const findErrorMails = async (messages: Array<Server.Mail>): Promise<Array<Server.Mail>> => {
      var errorMessage: Array<Server.Mail> = []
      console.log("Có " + messages.length + " mail cần check")
      for (let message of messages) {
        try {
          console.log("Đang check " + message.sender.e164)
          await saveMessageToLocal(message.sender, message.message)
          AppModule.ting(message.sender.e164)
        } catch (e) {
          errorMessage.push(message)
        }
      }
      return errorMessage
    }

    const onMailBox = (messages: Array<Server.Mail>, callback: (inComingMessageResult: SocketEvent.InComingMessageResult) => void) => {
      findErrorMails(messages).then((errors) => {
        console.log("Đã check mail với " + errors.length + " mail bị lỗi")
        callback({
          isProcessed: true
        })
        if (errors.length > 0) {
          console.log("Các mail xử lí thất bại")
          console.log(errors)
        }
      })

    }

    console.log("on socket")
    socket.on('requireBundle', onBundleRequire)
    socket.on('logged', onLogged)
    socket.on("connect_error", onConnectError);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('inComingMessage', inComingMessage)
    socket.on("sendMailbox", onMailBox)

    return () => {
      console.log("off socket")
      socket.off('requireBundle', onBundleRequire)
      socket.off('logged', onLogged)
      socket.off('connect_error', onConnectError);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('inComingMessage', inComingMessage)
      socket.off("sendMailbox", onMailBox)

    };
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (authStateInitializing) setAuthStateInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);



  // const needServer = true

  if (authStateInitializing || databaseInitializing || splashOpening /*|| (user && !socketConnection && needServer) */) {
    return (<Splash onAnimationFinished={() => setSplashOpening(false)} />);
  }


  return (
    <>
      <ApplicationProvider {...eva} theme={{ ...eva.light, ...MyBrandTheme }}>
        <SafeAreaProvider>
          {/* <NavigationContainer theme={scheme !== 'dark' ? DefaultNavigationTheme : DarkNavigationTheme}> */}
          <TopToast />
          <NavigationContainer theme={schema === 'dark' ? DarkTheme : LightTheme}>
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
                    <Stack.Screen name='Home' component={Home} options={({ navigation }) => ({
                      headerShown: true,
                      title: "Blackat",
                      headerRight: () => {
                        const menuItems: MenuItems[] = [
                          {
                            label: "test",
                            onPress: () => {
                              dispatch(showTopToast({ content: "Không có kết nối" }))
                            }
                          },
                          {
                            label: "Dev - clear all tables",
                            onPress: () => {
                              SignalModule.clearAllTables().then(() => {
                                DevSettings.reload()
                              })
                            }
                          },
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
      </ApplicationProvider>
    </>
  );
}

export default App;
