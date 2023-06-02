import { Alert, SafeAreaView, ToastAndroid, View, useColorScheme } from "react-native";
import { ActivityIndicator, Avatar, Button, DataTable, Dialog, IconButton, List, Portal, Text, TextInput, shadow, useTheme } from "react-native-paper";
import { AccountProps, PartnerProps, SettingProps } from "..";
import { useEffect, useState } from "react";
import { App } from "../../../shared/types";
import { AppTheme, darkThemeWithoutRoundness, lightThemeWithoutRoundness } from "../../theme";
import QRCode from 'react-native-qrcode-svg';
import SignalModule from "../../native/android/SignalModule";
import { ScrollView } from "react-native-gesture-handler";
import auth from '@react-native-firebase/auth';
import { useAppSelector } from "../../hooks";
import PinCodeInput from "../../components/PinCodeInput";
import AppModule from "../../native/android/AppModule";
import Log from "../../utils/Log";
import socket from "../../utils/socket";

export default function Account({ navigation, route }: AccountProps): JSX.Element {
    const theme = useTheme<AppTheme>()
    const [logoutDialog, setLogoutDialog] = useState<boolean>(false)

    const unknownError = (err: any) => {
        Log(err)
        ToastAndroid.show("Đã có lỗi xảy ra", 400)
    }

    const hideLogoutDialog = () => setLogoutDialog(false)
    const schema = useColorScheme()
    const socketConnection = useAppSelector(state => state.socketConnection.value)

    const [pinCodeInputForChange, setPinCodeInputForChange] = useState<boolean>(false)
    const [pinCodeInputForNewPin, setPinCodeInputForNewPin] = useState<boolean>(false)

    const onNewPin = async (pin: string) => {
        try {
            const result = await AppModule.setPin(pin)
            if (result) ToastAndroid.show("Mã pin đã được thay đổi", 400)

        } catch (err) { unknownError(err) }
    }

    const onChangePinVerification = async (pin: string) => {
        try {
            const result = await AppModule.verifyPin(pin)
            if (result) setPinCodeInputForNewPin(true)
            else {
                ToastAndroid.show("Mã pin không đúng", 400)
            }
        } catch (err) { unknownError(err) }


    }

    const onChangePin = async () => {
        try {
            const requirePin = await AppModule.requirePin()
            if (requirePin) {
                setPinCodeInputForChange(true)
            }
            else {
                setPinCodeInputForNewPin(true)
            }
        } catch (err) {
            unknownError(err)
        }

    }

    return (
        <SafeAreaView>
            <PinCodeInput visible={pinCodeInputForChange} dismiss={() => setPinCodeInputForChange(false)} submit={onChangePinVerification} />
            <PinCodeInput isNew visible={pinCodeInputForNewPin} dismiss={() => setPinCodeInputForNewPin(false)} submit={onNewPin} />
            <Portal>
                <Dialog visible={logoutDialog} onDismiss={hideLogoutDialog} theme={schema == 'dark' ? darkThemeWithoutRoundness : lightThemeWithoutRoundness}
                    style={{
                        borderRadius: 20,
                    }}>
                    <Dialog.Icon icon={'alert'} color={theme.colors.error} size={48} />
                    <Dialog.Title style={{
                        color: theme.colors.error,
                        fontWeight: 'bold'
                    }}>Nguy hiểm</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                            {"Thao tác này đồng nghĩa với việc:\n\xa0\xa0\xa0\xa0- Xóa toàn bộ dữ liệu cuộc trò chuyện, thông tin cá nhân, các khóa mã hóa trên thiết bị của bạn.\n\xa0\xa0\xa0\xa0- Xóa thông tin định danh và dữ liệu tin nhắn mới của thiết bị hiện tại trên máy chủ.\nBạn sẽ không thể hoàn tác, bạn vẫn muốn tiếp tục ?"}
                            </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => hideLogoutDialog()}>Hủy</Button>
                        <Button buttonColor={theme.colors.errorContainer} textColor={theme.colors.error} onPress={() => {
                            if (!socketConnection) {
                                ToastAndroid.show("Thao tác cần kết nối máy chủ, vui lòng thử lại sau", 400)
                                return;
                            }
                            socket.emit('removeDevice', () => {
                                ToastAndroid.show("Đã xóa dữ liệu trên máy chủ", 400)
                                SignalModule.onRemoveAccount().then(() => {
                                    ToastAndroid.show("Đã xóa dữ liệu trên thiết bị", 400)
                                })
                                .catch((e) => Log(e))
                                .finally(() => {
                                    auth()
                                        .signOut()
                                })

                            })

                        }}>Xóa tài khoản</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <View style={{
                height: '100%',
                width: '100%'
            }}>
                <ScrollView>
                    <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                        <List.Item
                            style={{
                                width: '100%',
                                paddingVertical: 15,
                                paddingHorizontal: 10,
                            }}

                            onPress={onChangePin}
                            title="Đổi mã PIN"
                            left={props => <List.Icon {...props} icon="pencil-lock-outline" />}
                        />
                        <View style={{
                            width: '100%',
                            paddingVertical: 10,
                        }}>
                            <View style={{
                                borderTopColor: theme.colors.onBackground,
                                borderTopWidth: 0.5,
                            }} />
                        </View>
                        <List.Item
                            style={{
                                width: '100%',
                                paddingVertical: 15,
                                paddingHorizontal: 10,
                            }}
                            titleStyle={{
                                color: theme.colors.error
                            }}

                            onPress={() => {
                                setLogoutDialog(true)
                            }}
                            title="Xóa tài khoản"
                            left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
                        />
                    </View>
                </ScrollView>
            </View>


        </SafeAreaView>
    )
}