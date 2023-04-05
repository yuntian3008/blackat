import { Alert, SafeAreaView, Text, TextInput, View } from "react-native";
import { LoginProps } from "..";
import { useEffect, useState } from "react";
import { IndexPath, Select, SelectItem, Input, Icon, Spinner } from "@ui-kitten/components";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getCountries, getCountryCallingCode, isPossiblePhoneNumber, isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js/mobile";
import { LoadingIndicator } from "../../components/Utils";
import { Button } from "react-native-paper";

function Login({ navigation }: LoginProps): JSX.Element {

    const countries = getCountries()

    const [selectedNationIndex, setSelectedNationIndex] = useState(new IndexPath(235));
    const [phoneNumber, setPhoneNumber] = useState("")
    const [e164Number, setE164Number] = useState<string>("")
    const [invalidPhoneNumber, setInvalidPhoneNumber] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    

    useEffect(() => {
        if (isValidPhoneNumber(phoneNumber, countries[selectedNationIndex.row])) {
            const phone = parsePhoneNumber(phoneNumber, countries[selectedNationIndex.row])
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



    const changePhoneNumber = () => {
        const callingCode = getCountryCallingCode(countries[selectedNationIndex.row])



    }


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
                } );
            else
                Alert.alert('Đã xảy ra lỗi','Không thể gửi mã xác minh')
        }
        catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }

    }

    return (
        <SafeAreaView>
            {/* UI kittin + style */}
            <View style={{ gap: 5, flexDirection: 'column', alignItems: 'center', height: '100%', paddingHorizontal: 20, paddingVertical: 40 }}>
                <Text className="text-3xl self-start text-neutral-700">
                    Nhập số điện thoại của bạn
                </Text>
                <Text className="self-start text-gray-700 text-md">
                    Chúng tôi sẽ gửi đến bạn mã xác minh
                </Text>
                <View className="flex flex-row w-full items-start gap-2 mt-5">
                    <Select
                        value={countries[selectedNationIndex.row]}
                        status="primary"
                        style={{
                            width: '30%'
                        }}
                        label={"Quốc gia"}
                        size="large"
                        caption={'+' + getCountryCallingCode(countries[selectedNationIndex.row])}
                        selectedIndex={selectedNationIndex}
                        onSelect={index => setSelectedNationIndex(index as IndexPath)}>
                        {countries.map((value, index) => (
                            <SelectItem title={value} key={index} />
                        ))}

                    </Select>
                    <Input
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
                    />
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