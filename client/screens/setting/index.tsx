import { Alert, Linking, SafeAreaView, ToastAndroid, View, useColorScheme } from "react-native";
import { ActivityIndicator, Avatar, Button, DataTable, Dialog, IconButton, List, Portal, Text, TextInput, shadow, useTheme } from "react-native-paper";
import { PartnerProps, SettingProps } from "..";
import { useCallback, useEffect, useState } from "react";
import { App } from "../../../shared/types";
import { AppTheme, darkThemeWithoutRoundness, lightThemeWithoutRoundness } from "../../theme";
import QRCode from 'react-native-qrcode-svg';
import SignalModule from "../../native/android/SignalModule";
import { ScrollView } from "react-native-gesture-handler";
import { LoadingOverlay } from "../../components/Utils";
import { MyAvatar } from "../../components/MyAvatar";
import { useFocusEffect } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAppSelector } from "../../hooks";
import { useNetInfo } from "@react-native-community/netinfo";

export default function Setting({ navigation, route }: SettingProps): JSX.Element {
    const theme = useTheme<AppTheme>()

    const [profile, setProfile] = useState<App.Types.Profile>()
    const schema = useColorScheme()
    const [connectionDialog, setConnectionDialog] = useState<boolean>(false)
    const hideConnectionDialog = () => setConnectionDialog(false)

    const fetchProfile = () => {
        SignalModule.getProfile().then((v) => {
            setProfile(v)
        }).catch((err) => {
            ToastAndroid.show("Tải dữ liệu hồ sơ thất bại", 400)
        })
    }

    // useEffect(() => {
    //     fetchProfile()
    // }, [])

    useFocusEffect(
        useCallback(() => {
            fetchProfile()
        }, [profile])
    );

    const [internetState, setInternetState] = useState<boolean>(false)

    const socketConnection = useAppSelector(state => state.socketConnection.value)

    const netInfo = useNetInfo()
    useEffect(() => {
        setInternetState(netInfo.isConnected === true)
    },[netInfo.isConnected])

    return (
        <SafeAreaView>
            <Portal>
                <Dialog theme={schema == 'dark' ? darkThemeWithoutRoundness : lightThemeWithoutRoundness}
                    style={{
                        borderRadius: 20,
                    }}
                    visible={connectionDialog} onDismiss={() => hideConnectionDialog()}>
                        <Dialog.Icon size={24} icon={'connection'}/>
                    <Dialog.Title style={{ textAlign: 'center' }}>Kiểm tra kết nối</Dialog.Title>
                    <Dialog.Content>
                        <View style={{
                            flexDirection: 'column',
                            gap: -10
                        }}>
                            <List.Item
                                style={{
                                    width: '100%',
                                }}
                                title="Máy chủ"
                                left={props => <List.Icon {...props} icon="server-network" />}
                                description={socketConnection ? 'Đã kết nối' : 'Không có kết nối'}
                                descriptionStyle={{ color: socketConnection ? theme.colors.success : theme.colors.error }}
                                right={props => <Icon {...props} name="circle-small" size={64} color={socketConnection ? theme.colors.success : theme.colors.error} />}
                            />
                            <List.Item
                                style={{
                                    width: '100%',
                                }}
                                title="Internet"
                                left={props => <List.Icon {...props} icon="web" />}
                                description={internetState ? 'Đã kết nối' : 'Không có kết nối'}
                                descriptionStyle={{ color: internetState ? theme.colors.success : theme.colors.error }}
                                right={props => <Icon {...props} name="circle-small" size={64} color={internetState ? theme.colors.success : theme.colors.error} />}
                            />
                        </View>

                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => hideConnectionDialog()}>Xong</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {
                profile !== undefined ?
                    <View style={{
                        height: '100%',
                        width: '100%'
                    }}>
                        <ScrollView>
                            <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <List.Item
                                    style={{
                                        width: '100%',
                                        paddingHorizontal: 20,
                                        paddingVertical: 20,
                                    }}
                                    onPress={() => {
                                        navigation.navigate('Profile')
                                    }}
                                    left={props => <MyAvatar size={64} image={profile.avatar ?? undefined} />}
                                    titleStyle={{
                                        fontSize: 24
                                    }}
                                    title={profile.name ?? profile.e164}
                                    description={profile.name ? profile.e164 : undefined}
                                />
                                <List.Item
                                    style={{
                                        width: '100%',
                                        paddingVertical: 15,
                                        paddingHorizontal: 10,
                                    }}
                                    onPress={() => {
                                        navigation.navigate('Account')
                                    }}
                                    title="Tài khoản"
                                    left={props => <List.Icon {...props} icon="account" />}
                                />
                                <List.Item
                                    style={{
                                        width: '100%',
                                        paddingVertical: 15,
                                        paddingHorizontal: 10,
                                    }}
                                    onPress={() => {
                                        setConnectionDialog(true)
                                    }}
                                    onLongPress={() => {
                                        SignalModule.requireLocalAddress().then((address) => {
                                            Alert.alert("DebugInfo",`E164: ${address.e164}\nDeviceId: ${address.deviceId}`)    
                                        })
                                        
                                    }}
                                    title="Kiểm tra kết nối"
                                    left={props => <List.Icon {...props} icon="connection" />}
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
                                    onPress={() => {
                                        Linking.openURL("https://policies.google.com/privacy?hl=vn")
                                    }}
                                    title="Điều khoản và chính sách"
                                    left={props => <List.Icon {...props} icon="shield-lock-outline" />}
                                />
                            </View>
                        </ScrollView>
                    </View>
                    : <LoadingOverlay />
            }


        </SafeAreaView>
    )
}