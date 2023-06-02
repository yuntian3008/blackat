import { NativeModules, SafeAreaView, View, ToastAndroid } from "react-native";
import { Avatar, List, Searchbar, Text, TextInput } from "react-native-paper";
import { NewContactProps } from "..";
import { useEffect, useState } from "react";
import { isValidPhoneNumber, parsePhoneNumber, CountryCode } from "libphonenumber-js/mobile";
import SignalModule from "../../native/android/SignalModule";
import socket from "../../utils/socket";
import AppModule from "../../native/android/AppModule";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { enqueueTopToast } from "../../redux/TopToast";
import { TopToastType } from "../../components/TopToast";
import { App } from "../../../shared/types";
import { encryptAndSendMessage, saveMessageToLocal } from "../../utils/Messaging";
import { formatISO } from "date-fns";
import { readFile } from "react-native-fs";
import { getProfileData } from "../../utils/Setting";
import { ActivityIndicatorOverlay } from "../../components/Utils";

const { CURRENT_COUNTRY_CODE } = SignalModule.getConstants();

type SearchResult = {
    found: boolean,
    phoneNumber: string,
}



export default function NewContact({ navigation }: NewContactProps): JSX.Element {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const socketConnection = useAppSelector(state => state.socketConnection.value)
    const dispatch = useAppDispatch()

    const createConversation = async (searchResult: SearchResult) => {
        if (socketConnection) {
            // const profile = await SignalModule.getProfile()
            const profile = await getProfileData()
            const localAddress = await SignalModule.requireLocalAddress()
            const e164 = searchResult.phoneNumber
            const profileMessage: App.Types.MessageData = {
                data: profile,
                owner: App.MessageOwner.SELF,
                timestamp: formatISO(new Date()),
                type: App.MessageType.PROFILE,
                senderDevice: 0,
            }
            // console.log("SEND PROFILE")
            // console.log(profileMessage)
            try {
                setLoading(true)
                const result = await encryptAndSendMessage(localAddress!, e164, profileMessage)
                if (result) {
                    navigation.navigate('ChatZone', {
                        e164: searchResult.phoneNumber
                    })
                }
                else {
                    ToastAndroid.show("Gửi hồ sơ cá nhân thất bại", 400)
                }
            } catch (err)
            {   
                console.log("sending profile")
                console.log(err)
            } finally {
                setLoading(false)
            }
            
            
                   
           
        } else {
            dispatch(enqueueTopToast({
                content: 'Máy chủ bị gián đoạn',
                duration: 3000,
                type: TopToastType.error
            }))
        }

    }


    useEffect(() => {
        // console.log(CURRENT_COUNTRY_CODE)
        if (socketConnection) {
            if (isValidPhoneNumber(searchQuery, CURRENT_COUNTRY_CODE)) {
                const phone = parsePhoneNumber(searchQuery, CURRENT_COUNTRY_CODE)
                socket.emit('isSomeOneThere', phone.number, (result) => {
                    setSearchResult({
                        found: result,
                        phoneNumber: phone.number
                    })
                })
            }
            else {
                setSearchResult(null)
            }
        }
    }, [searchQuery]);

    useEffect(() => {
        // console.log(CURRENT_COUNTRY_CODE)
        if (socketConnection) {
            if (isValidPhoneNumber(searchQuery, CURRENT_COUNTRY_CODE)) {
                const phone = parsePhoneNumber(searchQuery, CURRENT_COUNTRY_CODE)
                socket.emit('isSomeOneThere', phone.number, (result) => {
                    setSearchResult({
                        found: result,
                        phoneNumber: phone.number
                    })
                })
            }
            else {
                setSearchResult(null)
            }
        }
    }, [searchQuery]);

    const onChangeSearch = (query: string) => setSearchQuery(query);
    return (
        <SafeAreaView>
            <ActivityIndicatorOverlay visible={loading}/>
            <View style={{ gap: 5, flexDirection: 'column', alignItems: 'center', height: '100%', paddingVertical: 20 }}>
                <Searchbar
                    style={{ marginHorizontal: 20 }}
                    keyboardType="phone-pad"
                    placeholder="Nhập số điện thoại"
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                />
                {
                    searchResult !== null
                        ?
                        <List.Item
                            onPress={searchResult.found ? () => {
                                createConversation(searchResult)
                            } : undefined}
                            style={{ width: "100%", paddingHorizontal: 20 }}
                            title={searchResult.phoneNumber}
                            titleStyle={{
                                fontWeight: "700"
                            }}
                            descriptionStyle={{
                                fontWeight: "100",
                                fontSize: 16
                            }}
                            description={searchResult.found ? "Bắt đầu trò chuyện" : "Nguời dùng chưa sử dụng Blackat"}
                            left={props => <Avatar.Icon size={48} icon={searchResult.found ? "account" : "account-question"} />}
                        />
                        :
                        <Text
                            variant="labelLarge"
                            style={{
                                width: "100%",
                                padding: 20,
                                textAlign: 'center'
                            }}
                        >Không tìm thấy kết quả</Text>

                }
            </View>
        </SafeAreaView>
    )
}