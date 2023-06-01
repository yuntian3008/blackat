import { Alert, SafeAreaView, View } from "react-native";
import { LoginProps } from "..";
import { useEffect, useState } from "react";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { CountryCode, getCountries, getCountryCallingCode, isPossiblePhoneNumber, isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js/mobile";
import { LoadingIndicator } from "../../components/Utils";
import { Button, HelperText, Text, TextInput, useTheme } from "react-native-paper";
import { PaperSelect } from 'react-native-paper-select';
import { AppTheme } from "../../theme";

type SelectPaperProps = {
    value: string,
    list: Array<{
        _id: string,
        value: string,
    }>,
    selectedList: Array<{
        _id: string,
        value: string,
    }>,
    error: '',
}

export const selectValidator = (value: any) => {
    if (!value || value.length <= 0) {
        return 'Vui lòng chọn một giá trị.';
    }

    return '';
};

function Login({ navigation }: LoginProps): JSX.Element {

    const countries = getCountries()

    const [phoneNumber, setPhoneNumber] = useState("")
    const [e164Number, setE164Number] = useState<string>("")
    const [invalidPhoneNumber, setInvalidPhoneNumber] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    const [selectPaper, setSelectPaper] = useState<SelectPaperProps>({
        value: '',
        list: countries.map((country) => {
            return {
                _id: country,
                value: country
            }
        }),
        error: '',
        selectedList: []
    })

    useEffect(() => {
        let isMounted = true;
        let _getData = async () => {
            if (isMounted) {
                setSelectPaper({
                    ...selectPaper,
                    value: 'VN',
                    selectedList: [{ _id: 'VN', value: 'VN' }],
                });
            }
        };

        _getData();
        return () => {
            isMounted = false;
        };
    }, []);


    useEffect(() => {
        // console.log(countries)
        if (isValidPhoneNumber(phoneNumber, selectPaper.value as CountryCode)) {
            const phone = parsePhoneNumber(phoneNumber, selectPaper.value as CountryCode)
            setE164Number(phone.number)
            setInvalidPhoneNumber("")
        }
        else
            setInvalidPhoneNumber("Số điện thoại không hợp lệ")
    }, [phoneNumber])

    // useEffect(() => {
    //     const subscriber = auth().onAuthStateChanged((userState) => {
    //         if (userState)
    //             navigation.popToTop()
    //     });
    //     return subscriber; // unsubscribe on unmount
    // },);





    // Handle the button press
    async function signInWithPhoneNumber() {



        if (invalidPhoneNumber.length > 0 || e164Number.length == 0) return

        setLoading(true)
        try {
            const confirmation = await auth().signInWithPhoneNumber(e164Number)
            if (confirmation.verificationId)
                navigation.navigate('VerifyOtpCode', {
                    phoneNumber: e164Number,
                    verificationId: confirmation.verificationId
                });
            else
                Alert.alert('Đã xảy ra lỗi', 'Không thể gửi mã xác minh')
        }
        catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }

    }

    const theme = useTheme<AppTheme>()

    return (
        <SafeAreaView>
            {/* UI kittin + style */}
            <View style={{ gap: 10, flexDirection: 'column', alignItems: 'center', height: '100%', paddingHorizontal: 20, paddingVertical: 40 }}>
                <Text variant="headlineMedium" style={{
                    alignSelf: 'flex-start'
                }}>
                    Nhập số điện thoại của bạn
                </Text>
                <Text variant="titleSmall" style={{
                    alignSelf: 'flex-start'
                }}>
                    Chúng tôi sẽ gửi đến bạn mã xác minh
                </Text>
                <View style={{
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'flex-start',
                    gap: 2,
                    marginTop: 5
                }}>

                    <PaperSelect
                        textInputBackgroundColor={theme.colors.background}
                        textInputStyle={{
                            borderColor: 'red'
                        }}
                        outlineColor={theme.colors.outline}
                        textInputMode="outlined"
                        containerStyle={{
                            width: '30%',
                            backgroundColor: 'transparent'
                        }}
                        label={selectPaper.value}
                        value={selectPaper.value}
                        onSelection={(v) => {
                            setSelectPaper({
                                ...selectPaper,
                                value: v.text,
                                selectedList: v.selectedList,
                                error: '',
                            })
                        }}
                        arrayList={[...selectPaper.list]}
                        selectedArrayList={[...selectPaper.selectedList]}
                        errorText={selectPaper.error}
                        multiEnable={false}
                        textInputStyle={{

                        }}
                    />
                    <View style={{
                        flex: 1,
                    }}>
                        <TextInput
                            label="Số điện thoại"
                            mode="outlined"
                            keyboardType="phone-pad"
                            placeholder="090 123 4567"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                        <HelperText type="error" visible={invalidPhoneNumber.length > 0}>
                            { invalidPhoneNumber }
                        </HelperText>
                    </View>

                    {/* <Input
                        keyboardType="phone-pad"
                        status="primary"
                        style={{
                            flex: 1
                        }}
                        size="large"
                        label="Số điện thoại"
                        placeholder="090 123 4567"
                        caption={invalidPhoneNumber}
                        value={phoneNumber}
                        onChangeText={(text: string) => { setPhoneNumber(text); changePhoneNumber() }}
                    /> */}
                </View>


                <Button
                    icon="arrow-right"
                    mode="contained"
                    contentStyle={{ flexDirection: 'row-reverse' }}
                    style={{ marginTop: 'auto', alignSelf: 'flex-end' }}
                    loading={loading}
                    disabled={loading}
                    onPress={() => {
                        signInWithPhoneNumber()
                    }}>
                    Tiếp tục
                </Button>
            </View>
        </SafeAreaView>
    )
}

export default Login