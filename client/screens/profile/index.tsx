import { Alert, SafeAreaView, ToastAndroid, TouchableNativeFeedback, View, useColorScheme } from "react-native";
import { ActivityIndicator, Avatar, Button, Chip, DataTable, Dialog, IconButton, List, Portal, SegmentedButtons, Text, TextInput, shadow, useTheme } from "react-native-paper";
import { PartnerProps, ProfileProps, SettingProps } from "..";
import { useEffect, useState } from "react";
import { App } from "../../../shared/types";
import { AppTheme, darkThemeWithoutRoundness, lightThemeWithoutRoundness } from "../../theme";
import QRCode from 'react-native-qrcode-svg';
import SignalModule from "../../native/android/SignalModule";
import { ScrollView } from "react-native-gesture-handler";
import DocumentPicker from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { MyAvatar } from "../../components/MyAvatar";
import ImagePicker from 'react-native-image-crop-picker';
import { launchImageLibrary } from "react-native-image-picker";
import { updateAvatar, updateName } from "../../utils/Setting";
import { LoadingOverlay } from "../../components/Utils";



export default function Profile({ navigation, route }: ProfileProps): JSX.Element {
    const theme = useTheme<AppTheme>()

    const [profile, setProfile] = useState<App.Types.Profile>()

    const schema = useColorScheme()
    const [showAvatarSetting, setShowAvatarSetting] = useState<boolean>(false)
    const [showNameSetting, setShowNameSetting] = useState<boolean>(false)
    const [savingName, setSavingName] = useState<boolean>(false)

    const [nameTextInput, setNameTextInput] = useState<string>("")

    const fetchProfile = () => {
        SignalModule.getProfile().then((v) => {
            setProfile(v)
            setNameTextInput(v.name ?? "")
        }).catch((err) => {
            ToastAndroid.show("Tải dữ liệu hồ sơ thất bại", 400)
        })
    }


    const changeAvatarByCamera = async () => {
        try {
            const cropped = await ImagePicker.openCamera({
                width: 1000,
                height: 1000,
                cropperCircleOverlay: true,
                cropping: true,
            })

            const updated = await updateAvatar(cropped.path, cropped.mime)
            fetchProfile()
            setShowAvatarSetting(false)
        } catch (err) {
            ToastAndroid.show("Hình ảnh không được hỗ trợ", 400)
        }
    }

    const changeAvatarByImageLibrary = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
            })
            const image = result.assets?.[0].uri
            if (image) {
                const cropped = await ImagePicker.openCropper({
                    path: image,
                    width: 1000,
                    height: 1000,
                    cropperCircleOverlay: true,
                    cropping: true,
                    mediaType: 'photo'
                })

                const updated = await updateAvatar(cropped.path, cropped.mime)


                fetchProfile()
                setShowAvatarSetting(false)
            }

        } catch (err) {
            ToastAndroid.show("Hình ảnh không được hỗ trợ", 400)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    return (
        <SafeAreaView>
            <Portal>
                <Dialog theme={schema == 'dark' ? darkThemeWithoutRoundness : lightThemeWithoutRoundness}
                    style={{
                        borderRadius: 20,
                    }}
                    visible={showAvatarSetting} onDismiss={() => setShowAvatarSetting(false)}>
                    <Dialog.Title style={{ textAlign: 'center' }}>Tùy chỉnh ảnh</Dialog.Title>
                    <Dialog.Content style={{ gap: 25 }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center'
                        }}>
                            <MyAvatar size={128} image={profile ? profile.avatar : undefined} />
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-evenly'
                        }}>
                            <View style={{
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 5,
                            }}>
                                <Icon name="camera-outline" size={24} color={theme.colors.primary} style={{
                                    backgroundColor: theme.colors.primaryContainer,
                                    padding: 18,
                                    borderRadius: 20,
                                }} onPress={() => changeAvatarByCamera()} />
                                <Text variant="bodyMedium" style={{ color: theme.colors.tertiary }}>Máy ảnh</Text>
                            </View>

                            <View style={{
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 5,
                            }}>
                                <Icon name="image-outline" size={24} color={theme.colors.primary} style={{
                                    backgroundColor: theme.colors.primaryContainer,
                                    padding: 18,
                                    borderRadius: 20,
                                }} onPress={() => changeAvatarByImageLibrary()} />
                                <Text variant="bodyMedium" style={{ color: theme.colors.tertiary }}>Hình ảnh</Text>
                            </View>

                            <View style={{
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 5,
                            }}>
                                <IonIcon
                                    name="text" size={24} color={theme.colors.primary} style={{
                                        backgroundColor: theme.colors.primaryContainer,
                                        padding: 18,
                                        borderRadius: 20,
                                    }}
                                    onPress={() => {
                                        ToastAndroid.show("Sắp ra mắt", 500)
                                    }} />
                                <Text variant="bodyMedium" style={{ color: theme.colors.tertiary }}>Chữ cái</Text>
                            </View>










                            {/* <IconButton icon={'camera-outline'} mode="outlined" size={48} style={{ borderRadius: 20 }} /> */}
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowAvatarSetting(false)}>Xong</Button>
                    </Dialog.Actions>
                </Dialog>
                <Dialog theme={schema == 'dark' ? darkThemeWithoutRoundness : lightThemeWithoutRoundness}
                    style={{
                        borderRadius: 20,
                    }}
                    visible={showNameSetting} onDismiss={() => setShowNameSetting(false)}>
                    <Dialog.Title style={{ textAlign: 'center' }}>Cập nhật tên của bạn</Dialog.Title>
                    <Dialog.Content style={{ gap: 25 }}>
                        <TextInput
                            disabled={savingName}
                            style={{
                                width: '100%'
                            }}
                            label="Tên của bạn"
                            value={nameTextInput}
                            onChangeText={text => setNameTextInput(text)}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowNameSetting(false)}>Hủy</Button>
                        <Button loading={savingName} onPress={() => {
                            setSavingName(true)
                            updateName(nameTextInput).then(() => {
                                ToastAndroid.show("Cập nhật tên thành công", 400)
                                fetchProfile()
                                setShowNameSetting(false)
                            })
                            .catch((err) => {
                                ToastAndroid.show("Cập nhật tên thất bại", 400)
                                console.log(err)
                            })
                            .finally(() => {
                                setSavingName(false)
                            })
                        }}>Lưu</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            {
                profile !== undefined ? <View style={{
                    height: '100%',
                    width: '100%'
                }}>
                    <ScrollView>
                        <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                            <View
                                style={{
                                    width: '100%',
                                    flexDirection: 'column',
                                    paddingVertical: 20,
                                    alignItems: 'center',
                                    gap: 10,
                                }}
                            >
                                <MyAvatar size={96} image={profile.avatar ?? undefined} />
                                <Button mode="text"
                                    style={{
                                        backgroundColor: theme.colors.elevation.level2
                                    }}
                                    onPress={() => setShowAvatarSetting(true)}
                                >Tùy chỉnh ảnh</Button>
                            </View>
                            <List.Item
                                style={{
                                    width: '100%',
                                    paddingVertical: 15,
                                    paddingHorizontal: 20,
                                }}
                                onPress={() => { setShowNameSetting(true) }}
                                title={profile.name ?? profile.e164 ?? ""}
                                description="Tên của bạn"
                                left={props => <List.Icon {...props} icon="card-account-details-outline" />}
                            />
                            <Text variant="bodyMedium" style={{
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                            }}>
                                Thông tin cá nhân bên trong hồ sơ chỉ hiển thị với người mà bạn nhắn tin, những thông tin này chỉ được trao đổi qua kênh mã hóa mà bạn đã thiết lập với người liên hệ khác.
                            </Text>
                        </View>
                    </ScrollView>
                </View> : <LoadingOverlay />
            }



        </SafeAreaView >
    )
}