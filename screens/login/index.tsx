import { SafeAreaView, Text, TextInput, View } from "react-native";
import { LoginProps } from "..";
import { useEffect, useState } from "react";
import { IndexPath, Layout, Select, SelectItem, Button, Input, Icon, Spinner } from "@ui-kitten/components";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getCountries, getCountryCallingCode, isPossiblePhoneNumber, isValidPhoneNumber, parsePhoneNumber, validatePhoneNumberLength } from "libphonenumber-js/mobile";
import { getPhoneCode } from "libphonenumber-js";

function Login({ navigation }: LoginProps): JSX.Element {

    const countries = getCountries()

    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult>();

    const [selectedNationIndex, setSelectedNationIndex] = useState(new IndexPath(0));
    const [phoneNumber, setPhoneNumber] = useState("")
    const [e164Number, setE164Number] = useState<string>("")
    const [invalidPhoneNumber, setInvalidPhoneNumber] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    const LoadingIndicator = (props: any) =>
        <View style={[props.style, {
            justifyContent: 'center',
            alignItems: 'center'
        }]}>
            <Spinner size='small' status="basic" />
        </View>

    useEffect(() => {
        if (isValidPhoneNumber(phoneNumber, countries[selectedNationIndex.row])) {
            const phone = parsePhoneNumber(phoneNumber, countries[selectedNationIndex.row])
            setE164Number(phone.number)
            setInvalidPhoneNumber("")
        }
        else
            setInvalidPhoneNumber("Số điện thoại không hợp lệ")
    }, [phoneNumber])

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged((userState) => {
            if (userState)
                navigation.popToTop()
        });
        return subscriber; // unsubscribe on unmount
    },);



    const changePhoneNumber = () => {
        const callingCode = getCountryCallingCode(countries[selectedNationIndex.row])



    }


    // Handle the button press
    async function signInWithPhoneNumber() {
        if (invalidPhoneNumber.length > 0 || e164Number.length == 0) return

        setLoading(true)
        try {
            const confirmation = await auth().signInWithPhoneNumber(e164Number)
            setLoading(false)
            setConfirm(confirmation);
        }
        catch (err) {
            console.log(err)
        }

    }

    return (
        <SafeAreaView>
            {/* UI kittin + style */}
            <Layout style={{ gap: 5, flexDirection: 'column', alignItems: 'center', height: '100%', paddingHorizontal: 20, paddingVertical: 40 }}>
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
                    style={{ marginTop: 'auto', alignSelf: 'flex-end', borderRadius: 90 }}
                    accessoryRight={loading ? LoadingIndicator : undefined}
                    disabled={loading}
                    onPress={() => {
                        signInWithPhoneNumber()
                    }}>
                    Tiếp tục
                </Button>
            </Layout>
        </SafeAreaView>
    )
}

export default Login