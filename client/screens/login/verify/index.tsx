import { Alert, SafeAreaView,  ToastAndroid, View } from "react-native";

import { Ref, useEffect, useRef, useState } from "react";

import { VerifyOtpCodeProps } from "../..";
import { LoadingIndicator, LoadingOverlay } from "../../../components/Utils";
import OtpInputs, { OtpInputsRef } from "react-native-otp-inputs";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Button, Text, useTheme } from "react-native-paper";
import { AppTheme } from "../../../theme";

function VerifyOtpCode({ navigation, route }: VerifyOtpCodeProps): JSX.Element {


    const [loading, setLoading] = useState<boolean>(false)
    const [code, setCode] = useState<string | null>("")
    const otpRef = useRef<OtpInputsRef>()
    const [verificationId, setVerificationId] = useState<string>(route.params.verificationId)
    

    // useEffect(() => {
    //     const subscriber = auth().onAuthStateChanged((userState) => {
    //         if (userState)
    //             navigation.popToTop()
    //     });
    //     return subscriber; // unsubscribe on unmount
    // },);
    const [countDown, setCountDown] = useState<number>(180)

    useEffect(() => {
        if (countDown > 0) {
            setTimeout(() => setCountDown(countDown - 1),1000)
        }
    }, [countDown])

    async function tryAgain() {
        try {
            setLoading(true)
            const confirmation = await auth().signInWithPhoneNumber(route.params.phoneNumber,true)
            if (confirmation.verificationId) {
                setVerificationId(confirmation.verificationId)
                ToastAndroid.show('Đã gửi lại mã xác minh', ToastAndroid.SHORT)
                setCountDown(180)
            }
                
            else
            ToastAndroid.show('Đã xảy ra lỗi. Không thể gửi lại mã xác minh', ToastAndroid.SHORT)
        }
        catch (err) {
            ToastAndroid.show('Đã xảy ra lỗi. Không thể gửi lại mã xác minh', ToastAndroid.SHORT)
        } finally {
            setLoading(false)
        }
    }

    async function confirmCode(code: string) {
        try {
            // WARNING SETSTATE HERE
            setLoading(true)
            const credential = auth.PhoneAuthProvider.credential(verificationId, code)
            
            await auth().signInWithCredential(credential)
            ToastAndroid.show('Đăng nhập thành công', ToastAndroid.SHORT)
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('auth/invalid-verification-code'))
                    ToastAndroid.show("Mã xác thực không hợp lệ",400)
            }
        } finally {
            setLoading(false)
        }
    }

    const onChangeCode = (otpCode: string) => {
        if (otpCode.length == 6)
            confirmCode(otpCode)
    }

    const theme = useTheme<AppTheme>()

    return (
        <SafeAreaView>
            {loading && <LoadingOverlay/>}
            {/* UI kittin + style */}
            <View style={{ gap: 5, flexDirection: 'column', alignItems: 'center', height: '100%', paddingHorizontal: 20, paddingVertical: 20 }}>
                <Text variant="titleLarge" style={{ alignSelf: 'flex-start'}}>
                    Nhập mã xác minh {code}
                </Text>
                <Text variant="bodyMedium" style={{ alignSelf: 'flex-start'}}>
                    Mã xác minh đã được gửi đến số điện thoại của bạn
                </Text>
                <OtpInputs
                    autoFocus
                    style={{
                        marginTop: 40,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                    inputStyles={{
                        borderWidth: 0.5,
                        borderColor: theme.colors.outline,
                        color: theme.colors.onBackground,
                        borderRadius: 10,
                        padding: 10,
                        fontSize: 32,
                        textAlign: 'center'
                    }}
                    inputContainerStyles={{
                        width: '12%',
                    }}
                    autofillFromClipboard
                    handleChange={text => onChangeCode(text.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, ''))}
                    numberOfInputs={6}
                />
                <Button disabled={countDown > 0} onPress={tryAgain} >{countDown == 0 ? "Gửi lại mã xác thực" : `Thử lại sau: ${countDown} giây`}</Button>
            </View>
        </SafeAreaView>
    )
}

export default VerifyOtpCode