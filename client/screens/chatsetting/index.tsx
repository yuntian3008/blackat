import { Alert, SafeAreaView, ToastAndroid, View, useColorScheme } from "react-native";
import { ActivityIndicator, Avatar, Button, DataTable, Dialog, IconButton, List, Portal, Switch, Text, TextInput, shadow, useTheme } from "react-native-paper";
import { ChatSettingProps} from "..";
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

export default function ChatSetting({ navigation, route }: ChatSettingProps): JSX.Element {
    const theme = useTheme<AppTheme>()
    const [logoutDialog, setLogoutDialog] = useState<boolean>(false)

    const unknownError = (err: any) => {
        Log(err)
        ToastAndroid.show("Đã có lỗi xảy ra", 400)
    }

    const hideLogoutDialog = () => setLogoutDialog(false)
    const schema = useColorScheme()
    const socketConnection = useAppSelector(state => state.socketConnection.value)
    const [isEnablePinSecurity, setIsEnablePinSecurity] = useState(route.params.conversation.enablePinSecurity);

    const onEnablePinSecurityToggleSwitch = (state: boolean) => {
        // AppModule
        setPinCodeInput(true)
    }

    const [pinCodeInput, setPinCodeInput] = useState<boolean>(false)

    const verifyPin = (pin: string) => {
        AppModule.verifyPin(pin).then((r) => {
            if(r)
                AppModule.changeEnablePinSecurity(route.params.conversation.e164, !isEnablePinSecurity).then((r) => {
                    setIsEnablePinSecurity(!isEnablePinSecurity)
                }).catch(unknownError)
            else
                ToastAndroid.show("Mã pin không hợp lệ", 400)
        }).catch(unknownError)
    }

    return (
        <SafeAreaView>
            <PinCodeInput visible={pinCodeInput} dismiss={() => setPinCodeInput(false)} submit={verifyPin}/>
            <Portal>
                <Dialog visible={logoutDialog} onDismiss={hideLogoutDialog} theme={schema == 'dark' ? darkThemeWithoutRoundness : lightThemeWithoutRoundness}
                    style={{
                        borderRadius: 20,
                    }}>
                    <Dialog.Icon icon={'alert'} color={theme.colors.error} size={48} />
                    <Dialog.Title style={{
                        color: theme.colors.error,
                        fontWeight: 'bold'
                    }}>{`Bạn có chắc muốn xóa cuộc trò chuyện với ${route.params.conversation.e164} ?`}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{`Dữ liệu trò chuyện này chỉ được xóa ở phía bạn và không thể khôi phục.`}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => hideLogoutDialog()}>Hủy</Button>
                        <Button buttonColor={theme.colors.errorContainer} textColor={theme.colors.error} onPress={() => {
                            AppModule.removeConversation(route.params.conversation.e164).then((v) => {
                                if (v) {
                                    navigation.navigate('Home')
                                    ToastAndroid.show("Đã xóa cuộc trò chuyện", 400)
                                } else {
                                    ToastAndroid.show("Đã xảy ra lỗi", 400)
                                }
                            })
                        }}>Xóa cuộc trò chuyện</Button>
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
                            // onPress={onChangePin}
                            title="Bảo vệ cuộc trò chuyện"
                            left={props => <List.Icon {...props} icon="message-lock-outline" />}
                            right={props => <Switch value={isEnablePinSecurity} onValueChange={onEnablePinSecurityToggleSwitch} />}
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
                            title="Xóa cuộc trò chuyện"
                            left={props => <List.Icon {...props} icon="message-off-outline" color={theme.colors.error} />}
                        />
                    </View>
                </ScrollView>
            </View>


        </SafeAreaView>
    )
}