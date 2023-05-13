/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry, NativeModules, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProp } from 'react-native-paper/lib/typescript/src/types'
import App from './App';
import { name as appName } from './app.json';
import { darkTheme, lightTheme } from './theme';
import SignalModule from './native/android/SignalModule';
import { Provider } from 'react-redux';
import store from './store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import { onMessageReceived, updateChat } from './utils/Fcm';
import notifee, { EventType } from '@notifee/react-native'


export default function Main() {
    // SignalModule.testBasicPreKeyV3()
    SignalModule.onFirstEverAppLaunch()
        .then((v) => {
            console.log(v ? "Đã khởi tạo lần đầu thành công" : "Khởi tạo lần đầu thất bại")
        }).catch((e) => {
            console.log(e)
        })
    messaging().setBackgroundMessageHandler(onMessageReceived)
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'reply') {
            await updateChat(detail.notification, detail.input);
            // await notifee.cancelNotification(detail.notification.id);
        }
    })
    const colorScheme = useColorScheme()
    return (
        <Provider store={store}>
            <PaperProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <App />
                </GestureHandlerRootView>
            </PaperProvider>
        </Provider>

    );
}

AppRegistry.registerComponent(appName, () => Main);
