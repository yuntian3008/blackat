import { NativeModules, SafeAreaView, View, ToastAndroid} from "react-native";
import { Avatar, List, Searchbar, Text, TextInput } from "react-native-paper";
import { NewContactProps } from "..";
import { useEffect, useState } from "react";
import { isValidPhoneNumber, parsePhoneNumber, CountryCode } from "libphonenumber-js/mobile";
import SignalModule from "../../native/android/SignalModule";
import socket from "../../utils/socket";
import AppModule from "../../native/android/AppModule";
import { useAppSelector } from "../../hooks";

const { CURRENT_COUNTRY_CODE } = SignalModule.getConstants();

type SearchResult = {
    found: boolean,
    phoneNumber: string,
}



export default function NewContact({ navigation }: NewContactProps): JSX.Element {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null)

    const createConversation = async (searchResult: SearchResult) => {
        if (socketConnection) {
            navigation.navigate('ChatZone', {
                e164: searchResult.phoneNumber
            })
        } else {
            ToastAndroid.show("Không có kết nối", ToastAndroid.SHORT)
        }

    }

    const socketConnection = useAppSelector(state => state.socketConnection.value)

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