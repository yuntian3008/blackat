import { Alert, SafeAreaView, StyleSheet, View, useColorScheme } from "react-native";
import { ActivityIndicator, Avatar, Button, DataTable, Dialog, IconButton, List, Portal, Text, TextInput, shadow, useTheme } from "react-native-paper";
import { QrscannerProps } from "..";
import { useEffect, useState } from "react";
import { App } from "../../../shared/types";
import { AppTheme, darkThemeWithoutRoundness, lightThemeWithoutRoundness } from "../../theme";
import QRCode from 'react-native-qrcode-svg';
import SignalModule from "../../native/android/SignalModule";
import { useCameraDevices, useFrameProcessor } from "react-native-vision-camera"
import { Camera } from 'react-native-vision-camera';
import { LoadingOverlay } from "../../components/Utils";
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';

const styles = StyleSheet.create({
    barcodeTextURL: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
});



export default function Qrscanner({ navigation, route }: QrscannerProps): JSX.Element {
    const [hasPermission, setHasPermission] = useState(false);
    const devices = useCameraDevices();
    const device = devices.back;
    const [visible, setVisible] = useState(false);
    const [comparing,setComparing] = useState(false);
    const [dialogData, setDialogData] = useState<App.Types.DialogData>({
        icon: 'infomation',
        title: '',
        content: '',
    })

    const showDialog = () => setVisible(true);

    const hideDialog = () => setVisible(false);

    const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
        checkInverted: true,

    });

    const schema = useColorScheme()

    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'authorized');
        })();
    }, []);

    useEffect(() => {
        if (barcodes.length > 0 && !visible && barcodes[0].rawValue && !comparing) {
            setComparing(true)
            SignalModule.compareFingerprint(barcodes[0].rawValue, route.params.input! as string).then((result) => {
                setDialogData({
                    icon: result ? 'check-circle-outline' : 'alert-outline',
                    title: result ? 'Xác thực thành công' : 'Xác thực không thành công',
                    content: result ? `Tin nhắn của bạn và ${route.params.input!} đã được mã hóa đầu cuối.` : `Có thể bạn đã quét mã của người liên hệ khác hoặc một số điện thoại khác. Nếu liên hệ của bạn gần đây đã cài đặt lại ứng dụng, thay đổi số điện thoại, thêm hoặc thiết bị, chúng tôi khuyên bạn nên làm mới mã bằng cách gửi cho họ một tin nhắn mới rồi kiểm tra lại.`
                })
                showDialog()
            }).finally(() => {
                setComparing(false)
            })
            
        }

    }, [barcodes])

    if (device == null || !hasPermission) return <LoadingOverlay />
    return (
        <>

            <Portal>
                <Dialog visible={visible} style={{ borderRadius: 20 }} onDismiss={hideDialog} theme={schema == 'dark' ? darkThemeWithoutRoundness : lightThemeWithoutRoundness}>
                    <Dialog.Icon size={32} icon={dialogData.icon}/>
                    <Dialog.Title>{dialogData.title}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">{dialogData.content}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            hideDialog()
                            navigation.goBack()
                        }}>Hoàn tất</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                frameProcessor={frameProcessor}
                frameProcessorFps={5}
            />
            <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                padding: 20,
            }}>
                <Text style={{
                    fontSize: 16,
                    textAlign: 'center'
                }}>Quét mã trên điện thoại của người liên hệ</Text>
            </View>
            
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',

            }}>
                
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 210,
                    height: 210,
                    borderWidth: 3,
                    borderColor: 'white',
                    borderRadius: 40,
                }}>
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 200,
                        height: 200,
                        borderWidth: 3,
                        borderColor: 'white',
                        borderRadius: 40,
                        borderStyle: 'dashed'
                    }}>

                    </View>
                </View>

            </View>
        </>
    )

}