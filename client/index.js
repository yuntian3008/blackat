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
import notifee, { AndroidImportance, AuthorizationStatus, EventType } from '@notifee/react-native'

messaging().setBackgroundMessageHandler(onMessageReceived)
SignalModule.onFirstEverAppLaunch()
    .then((v) => {
        console.log(v ? "Đã khởi tạo lần đầu thành công" : "Khởi tạo lần đầu thất bại")
    }).catch((e) => {
        console.log(e)
    })
notifee.requestPermission().then((result) => {
    if (result.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        notifee.createChannel({
            id: 'inComingMessage',
            name: 'Tin nhắn đến',
            // groupId: 'conversation',
            lights: true,
            vibration: true,
            vibrationPattern: [300, 300, 300, 300],
            sound: 'incoming',
            badge: true,
            importance: AndroidImportance.HIGH
        })

        notifee.onBackgroundEvent(async ({ type, detail }) => {
            if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'reply') {
                await updateChat(detail.notification, detail.input);
                // await notifee.cancelNotification(detail.notification.id);
            }
        })
    }
})

export default function Main() {
    // SignalModule.testBasicPreKeyV3()


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

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => {

})