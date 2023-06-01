import { Layout } from "@ui-kitten/components";
import { Alert, NativeModules, SafeAreaView, ScrollView, ToastAndroid, View, useColorScheme } from "react-native";
import auth from '@react-native-firebase/auth';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ConversationProps } from "../..";
import { Avatar, Badge, Button, Dialog, FAB, List, Portal, Text, TouchableRipple, useTheme } from "react-native-paper";
import ConversationItem, { Conversation as ConversationData } from "../../../components/ConversationItem";
import { LoremIpsum } from "lorem-ipsum";
import DeviceInfo from 'react-native-device-info';
import socket from "../../../utils/socket";
import { LoadingOverlay } from "../../../components/Utils";
import { useEffect, useState } from "react";
import AppModule from "../../../native/android/AppModule";
import EmptyItem from "../../../components/EmptyItem";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { App } from "../../../../shared/types";
import { enqueueTopToast } from "../../../redux/TopToast";
import { TopToastType } from "../../../components/TopToast";
import { darkThemeWithoutRoundness, lightThemeWithoutRoundness } from "../../../theme";
import { compareAsc, compareDesc, parseISO } from "date-fns";
import PinCodeInput from "../../../components/PinCodeInput";



function Conversation({ navigation }: ConversationProps): JSX.Element {

    const [loading, setLoading] = useState<boolean>(false)
    const [conversations, setConversations] = useState<Array<ConversationData> | null>(null)
    const theme = useTheme()
    const [conversationOption, setConversationOption] = useState<App.Types.Conversation>();

    const hideDialog = () => setConversationOption(undefined);


    const conversationData = useAppSelector(state => state.conversationData.value)
    const socketConnection = useAppSelector(state => state.socketConnection.value)
    const dispatch = useAppDispatch()

    const schema = useColorScheme()
    const startChat = (conversation: App.Types.Conversation) => {
        AppModule.markAllPartnerMessageAsRead(conversation.id)
        navigation.getParent()?.navigate('ChatZone', {
            e164: conversation.e164
        })
    }

    useEffect(() => {
        const ui: Array<ConversationData> = []
        conversationData.forEach((v) => {
            if (v.messages.length > 0) {
                const lastMessage = v.messages[v.messages.length - 1].message
                const unreadMessage = v.messages.filter(r => r.message.state === App.MessageState.UNREAD)
                let contentLastMessage
                switch (lastMessage.type) {
                    case App.MessageType.TEXT:
                        contentLastMessage = lastMessage.data
                        break;
                    case App.MessageType.IMAGE:
                        contentLastMessage = lastMessage.owner == App.MessageOwner.SELF ? "Bạn đã gửi ảnh" : "[Hình ảnh]"
                        break;
                    case App.MessageType.STICKER:
                        contentLastMessage = lastMessage.owner == App.MessageOwner.SELF ? "Bạn đã gửi nhãn dán" : "[Nhãn dán]"
                        break;

                    default:
                        contentLastMessage = "[Tin nhắn]"
                        break;
                }
                ui.push({
                    isPinSecurity: v.conversation.enablePinSecurity,
                    name: v.partner.nickname ?? v.partner.name ?? v.conversation.e164,
                    lastDateTime: lastMessage.timestamp,
                    lastMessage: contentLastMessage,
                    ting: unreadMessage.length,
                    image: v.partner.avatar,
                    onImagePress: () => {
                        AppModule.getPartner(v.conversation.e164).then((partner) => {
                            if (partner !== null)
                                navigation.getParent()?.navigate('Partner', {
                                    partner: partner
                                })

                        }).catch((err) => {
                            Alert.alert("Không tìm thấy thông tin")
                            console.log(err)
                        })

                    },
                    onPress: () => {
                        setRequireStartConversation(v.conversation)
                        // if (v.conversation.enablePinSecurity) {

                        // }
                        // else {
                        //     AppModule.markAllPartnerMessageAsRead(v.conversation.id)
                        //     navigation.getParent()?.navigate('ChatZone', {
                        //         e164: v.conversation.e164
                        //     })
                        // }

                    },
                    onLongPress: () => {
                        setConversationOption(v.conversation)
                    }
                })
            }

        })
        setConversations(ui)
    }, [conversationData])

    

    const [pinCodeInput, setPinCodeInput] = useState(false)
    const [requireStartConversation, setRequireStartConversation] = useState<App.Types.Conversation>()

    useEffect(() => {
        if (requireStartConversation !== undefined) {
            if (requireStartConversation.enablePinSecurity) {
                setPinCodeInput(true)
            }
            else {
                startChat(requireStartConversation)
                setRequireStartConversation(undefined)
            }
        }
    }, [requireStartConversation])

    const dismissStartConversation = () => {
        setPinCodeInput(false) 
        setRequireStartConversation(undefined)
    }
    const submitPinRequireStartConversation = (pin: string) => {
        AppModule.verifyPin(pin)
        .then((r) => {
            if (r) {
                startChat(requireStartConversation!)
                setRequireStartConversation(undefined)
            }
            else {
                ToastAndroid.show("Mã pin không hợp lệ",400)
                setRequireStartConversation(undefined)
            }
        })
    }

    return (
        <SafeAreaView>
            {loading && <LoadingOverlay />}
            <PinCodeInput
                visible={pinCodeInput}
                dismiss={dismissStartConversation}
                submit={submitPinRequireStartConversation}
            />
            <Portal>
                <Dialog visible={conversationOption !== undefined} style={{ borderRadius: 20 }} onDismiss={hideDialog} theme={schema == 'dark' ? darkThemeWithoutRoundness : lightThemeWithoutRoundness}>
                    <Dialog.Title>{conversationOption?.e164}</Dialog.Title>
                    <Dialog.Content>
                        <View style={{
                            flexDirection: 'column'
                        }}>
                            <List.Item
                                title="Xem trang cá nhân"
                                onPress={() => {
                                    if (conversationOption)
                                        AppModule.getPartner(conversationOption.e164).then((partner) => {
                                            if (partner !== null)
                                                navigation.getParent()?.navigate('Partner', {
                                                    partner: partner
                                                })

                                        }).catch((err) => {
                                            Alert.alert("Không tìm thấy thông tin")
                                            console.log(err)
                                        })
                                    setConversationOption(undefined)
                                }}
                                // description="Item description"
                                left={props => <List.Icon {...props} icon="card-account-details" />}
                            />
                            <List.Item
                                title="Đánh dấu tất cả là đã đọc"
                                onPress={() => {
                                    if (conversationOption)
                                        AppModule.markAllPartnerMessageAsRead(conversationOption.id)
                                    setConversationOption(undefined)
                                }}
                                // description="Item description"
                                left={props => <List.Icon {...props} icon="email-open-multiple" />}
                            />
                        </View>
                    </Dialog.Content>
                </Dialog>
            </Portal>
            {/* UI kittin + style */}
            <View style={{ height: '100%', }}>
                <ScrollView>
                    <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                        {
                            (conversations === null || conversations?.length == 0) ?
                                <EmptyItem message="Không có cuộc trò chuyện nào" />
                                :
                                conversations.sort((a, b) => {
                                    return compareDesc(parseISO(a.lastDateTime), parseISO(b.lastDateTime))
                                }).map((conversation, index) =>
                                    <ConversationItem {...conversation} key={index} />
                                )
                        }
                    </View>

                </ScrollView>
                <FAB
                    onPress={() => {
                        if (!socketConnection)
                            dispatch(enqueueTopToast({
                                content: 'Máy chủ bị gián đoạn',
                                duration: 3000,
                                type: TopToastType.error
                            }))
                        navigation.getParent()?.navigate('NewContact')
                    }
                    }
                    icon="message-plus"
                    variant={'primary'}
                    size="medium"
                    style={{
                        position: 'absolute',
                        margin: 24,
                        right: 0,
                        bottom: 0,
                    }}
                />
            </View>


        </SafeAreaView>
    )
}

export default Conversation