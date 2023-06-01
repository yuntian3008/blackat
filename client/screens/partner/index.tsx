import { Alert, SafeAreaView, ToastAndroid, View, useColorScheme } from "react-native";
import { ActivityIndicator, Avatar, Button, DataTable, Dialog, IconButton, List, Portal, Text, TextInput, shadow, useTheme } from "react-native-paper";
import { PartnerProps } from "..";
import { useEffect, useState } from "react";
import { App } from "../../../shared/types";
import { AppTheme, darkThemeWithoutRoundness, lightThemeWithoutRoundness } from "../../theme";
import QRCode from 'react-native-qrcode-svg';
import SignalModule from "../../native/android/SignalModule";
import { ScrollView } from "react-native-gesture-handler";
import { MyAvatar } from "../../components/MyAvatar";
import AppModule from "../../native/android/AppModule";


export default function Partner({ navigation, route }: PartnerProps): JSX.Element {
    const theme = useTheme<AppTheme>()
    const [availableFingerprint, setAvailableFingerprint] = useState(false)
    const [loadingFingerprint, setLoadingFingerprint] = useState<boolean>(true)
    const [qrContent, setQrContent] = useState<string>()
    const [displayText, setDisplayText] = useState<string[][]>([])
    const displayName = route.params.partner.nickname ?? route.params.partner.name ?? route.params.partner.e164
    const schema = useColorScheme()
    const [showNameSetting, setShowNameSetting] = useState<boolean>(false)
    const [savingName, setSavingName] = useState<boolean>(false)

    const [nameTextInput, setNameTextInput] = useState<string>("")
    useEffect(() => {
        navigation.setOptions({
            title: "Hồ sơ người liên hệ"
        })
        const batchReduce = function <T>(arr: T[], batchSize: number): T[][] {
            return arr.reduce((batches, curr, i) => {
                if (i % batchSize === 0) batches.push([]);
                batches[batches.length - 1].push(arr[i]);
                return batches;
            }, [] as T[][]);
        }
        if (loadingFingerprint) {
            SignalModule.requireFingerprint(route.params.partner.e164).then((f) => {
                setQrContent(f.qrContent)
                const splited = f.displayText.match(/.{1,5}/g)
                const matrix = batchReduce<string>(splited as Array<string>, 4)
                setDisplayText(matrix)
                setAvailableFingerprint(true)
            }).catch((err) => {
                setAvailableFingerprint(false)
            }).finally(() => {
                setLoadingFingerprint(false)
            })
        }
    })

    return (
        <SafeAreaView>
            <Portal>
            <Dialog theme={schema == 'dark' ? darkThemeWithoutRoundness : lightThemeWithoutRoundness}
                    style={{
                        borderRadius: 20,
                    }}
                    visible={showNameSetting} onDismiss={() => setShowNameSetting(false)}>
                    <Dialog.Title style={{ textAlign: 'center' }}>Đặt biệt hiệu cho {route.params.partner.name ?? route.params.partner.e164}</Dialog.Title>
                    <Dialog.Content style={{ gap: 25 }}>
                        <TextInput
                            disabled={savingName}
                            style={{
                                width: '100%'
                            }}
                            label="Biệt hiệu"
                            value={nameTextInput}
                            onChangeText={text => setNameTextInput(text)}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                             AppModule.removePartnerNickname(route.params.partner.e164).then(() => {
                                ToastAndroid.show("Xóa biệt hiệu thành công", 400)
                                setNameTextInput("")
                                setShowNameSetting(false)
                                navigation.goBack()
                            })
                            .catch((err) => {
                                ToastAndroid.show("Xóa biệt hiệu thất bại", 400)
                                console.log(err)
                            })
                        }} textColor={theme.colors.error}>Xóa biệt hiệu</Button>
                        <Button onPress={() => setShowNameSetting(false)}>Hủy</Button>
                        <Button loading={savingName} onPress={() => {
                            setSavingName(true)
                            AppModule.changePartnerNickname(route.params.partner.e164, nameTextInput).then(() => {
                                ToastAndroid.show("Đặt biệt hiệu thành công", 400)
                                setNameTextInput("")
                                setShowNameSetting(false)
                                navigation.goBack()
                            })
                            .catch((err) => {
                                ToastAndroid.show("Đặt biệt hiệu thất bại", 400)
                                console.log(err)
                            })
                            .finally(() => {
                                setSavingName(false)
                            })
                        }}>Lưu</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <ScrollView>
                <View style={{ gap: 10, flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <View style={{
                        flexDirection: "column",
                        alignItems: 'center',
                        gap: 10,
                        justifyContent: 'center',
                        backgroundColor: theme.colors.elevation.level3,
                        width: '100%',
                        padding: 20,
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.23,
                        shadowRadius: 2.62,
                        elevation: 4,

                    }}>
                        <MyAvatar image={route.params.partner.avatar} />
                        <Text variant="headlineSmall">{displayName}</Text>
                        { 
                            route.params.partner.nickname || route.params.partner.name ?
                            <Text variant="titleMedium">{ route.params.partner.e164 }</Text> : null
                        }
                        <Button icon={'rename-box'} onPress={() => setShowNameSetting(true)} >Đặt biệt hiệu</Button>

                    </View>
                    {
                        <View style={{
                            flexDirection: "column",
                            alignItems: 'center',
                            gap: 10,
                            justifyContent: 'center',
                            backgroundColor: theme.colors.elevation.level3,
                            width: '100%',
                            padding: 20,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.23,
                            shadowRadius: 2.62,
                            elevation: 4,

                        }}>
                            <Text variant="titleMedium" style={{
                                fontWeight: 'bold',
                                alignSelf: 'flex-start',
                            }}>Xác minh bảo mật giữa bạn và {displayName}</Text>
                            {
                                availableFingerprint ?
                                    <Text variant="bodyMedium">
                                        Hãy quét mã hoặc so sánh mã bên dưới.Nếu quét mã thành công hoặc so sánh trùng khớp, xác minh rằng tin nhắn giữa bạn và {displayName} đã được mã hóa đầu cuối.
                                    </Text>
                                    :
                                    <Text variant="bodyMedium">
                                        Tính năng này hoạt động khi cả hai đều gửi ít nhất một tin nhắn cho nhau, vui lòng chờ người liên hệ phản hồi.
                                    </Text>
                            }
                            {
                                availableFingerprint ?
                                    (
                                        <>
                                            <View style={{
                                                backgroundColor: 'white',
                                                padding: 40,
                                                borderRadius: 100,
                                            }}>
                                                {
                                                    loadingFingerprint ?
                                                        <ActivityIndicator size={100} animating={true} color={theme.colors.primary} /> :
                                                        <QRCode
                                                            value={qrContent}
                                                            // backgroundColor={theme.colors.elevation.level3}
                                                            logoBorderRadius={20}
                                                        />
                                                }

                                            </View>
                                            {
                                                loadingFingerprint ?
                                                    <ActivityIndicator size={100} animating={true} color={theme.colors.primary} /> :
                                                    <DataTable>
                                                        <DataTable.Row>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[0][0]}</DataTable.Cell>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[0][1]}</DataTable.Cell>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[0][2]}</DataTable.Cell>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[0][3]}</DataTable.Cell>
                                                        </DataTable.Row>
                                                        <DataTable.Row>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[1][0]}</DataTable.Cell>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[1][1]}</DataTable.Cell>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[1][2]}</DataTable.Cell>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[1][3]}</DataTable.Cell>
                                                        </DataTable.Row>
                                                        <DataTable.Row>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[2][0]}</DataTable.Cell>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[2][1]}</DataTable.Cell>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[2][2]}</DataTable.Cell>
                                                            <DataTable.Cell style={{ justifyContent: 'center' }}>{displayText[2][3]}</DataTable.Cell>
                                                        </DataTable.Row>
                                                    </DataTable>
                                            }
                                            <Button style={{
                                                alignSelf: 'flex-end'
                                            }}
                                                mode="contained"
                                                icon={'qrcode-scan'}
                                                onPress={() => {
                                                    navigation.navigate('Qrscanner', {
                                                        input: route.params.partner.e164
                                                    })
                                                }}
                                            >Quét mã</Button>
                                        </>
                                    )
                                    : null
                            }



                        </View>
                    }
                </View>
            </ScrollView>

        </SafeAreaView>
    )
}