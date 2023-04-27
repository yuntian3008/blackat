import { Alert, SafeAreaView, Text, TextInput, ToastAndroid, View } from "react-native";

import { Ref, useEffect, useRef, useState } from "react";

import { VerifyOtpCodeProps } from "../..";
import { LoadingIndicator, LoadingOverlay } from "../../../components/Utils";
import OtpInputs, { OtpInputsRef } from "react-native-otp-inputs";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

function VerifyOtpCode({ navigation, route }: VerifyOtpCodeProps): JSX.Element {


    const [loading, setLoading] = useState<boolean>(false)
    const [code, setCode] = useState<string | null>("")
    const otpRef = useRef<OtpInputsRef>()
    

    // useEffect(() => {
    //     const subscriber = auth().onAuthStateChanged((userState) => {
    //         if (userState)
    //             navigation.popToTop()
    //     });
    //     return subscriber; // unsubscribe on unmount
    // },);

    async function confirmCode(code: string) {
        try {
            // WARNING SETSTATE HERE
            setLoading(true)
            const credential = auth.PhoneAuthProvider.credential(route.params.verificationId, code)
            
            await auth().signInWithCredential(credential)
            ToastAndroid.show('Đăng nhập thành công', ToastAndroid.SHORT)
        } catch (error) {
            console.log('Invalid code.');
        } finally {
            setLoading(false)
        }
    }

    const onChangeCode = (otpCode: string) => {
        if (otpCode.length == 6)
            confirmCode(otpCode)
    }


    return (
        <SafeAreaView>
            {loading && <LoadingOverlay/>}
            {/* UI kittin + style */}
            <View style={{ gap: 5, flexDirection: 'column', alignItems: 'center', height: '100%', paddingHorizontal: 20, paddingVertical: 20 }}>
                <Text className="text-3xl self-start text-neutral-700">
                    Nhập mã xác minh {code}
                </Text>
                <Text className="self-start text-gray-700 text-md">
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
                        borderWidth: 1,
                        borderColor: '#171717',
                        borderRadius: 5,
                        padding: 10,
                        fontSize: 32,
                        textAlign: 'center'
                    }}
                    inputContainerStyles={{
                        width: '12%',
                    }}
                    autofillFromClipboard
                    handleChange={onChangeCode}
                    numberOfInputs={6}
                />
            </View>
        </SafeAreaView>
    )
}

export default VerifyOtpCode