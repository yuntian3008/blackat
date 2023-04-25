import { Alert, SafeAreaView, ToastAndroid, View } from "react-native";
import { Avatar, Divider, IconButton, List, Menu, Modal, Portal, Searchbar, Text, TextInput, useTheme } from "react-native-paper";
import { ChatZoneProps } from "..";
import { useEffect, useRef, useState } from "react";
import Header, { HeaderItems } from "../../components/Header";
import ChatItem, { BubbleChat, BubbleChatType, ChatItemKind, ChatItemProps, toBubbleChatType } from "../../components/ChatItem";
import Chat, { ConversationState } from "../../components/Chat";
import { ScrollView } from "react-native";
import { formatISO } from "date-fns";
import { faker } from '@faker-js/faker';
import { App, Server, Signal, SocketEvent } from "../../../shared/types";
import socket, { getAddresses, getPreKeyBundle, outGoingMessage } from "../../utils/socket";
import SignalModule from "../../native/android/SignalModule";
import { el, ms } from "date-fns/locale";
import AppModule from "../../native/android/AppModule";
import { useAppSelector } from "../../hooks";



export default function ChatZone({ navigation, route }: ChatZoneProps): JSX.Element {
    const theme = useTheme()
    const [message, setMessage] = useState<string>('');
    // const [partnerIsTyping, setPartnerIsTyping] = useState<string[]>([
    // ])
    const [bubbles, setBubbles] = useState<ChatItemProps[]>([])
    const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.unknown)
    const [visibleEmoji, setVisibleEmoji] = useState<boolean>(false)


    const [conversation, setConversation] = useState<App.Types.Conversation>()
    const [messages, setMessages] = useState<Array<App.Types.Message>>([])

    const [initializing, setInitializing] = useState<boolean>(true)
    const [newConversation, setNewConversation] = useState<boolean>(false)
    const [localAddress, setLocalAddress] = useState<Signal.Types.SignalProtocolAddress>()

    const onChangeMessage = (message: string) => setMessage(message);
    const showEmojiModal = () => setVisibleEmoji(true);
    const hideEmojiModal = () => setVisibleEmoji(false);


    useEffect(() => {
        const initialize = async () => {
            try {
                const localAddress = await SignalModule.requireLocalAddress()
                setLocalAddress(localAddress)
            } catch (e) {
                console.log(e)
            }



        }
        if (initializing) {
            initialize().then(() => {
                setInitializing(false)
            })
        }
    })

    const conversationData = useAppSelector(state => state.conversationData.value)

    useEffect(() => {
        const ui: Array<ChatItemProps> = []
        const thisConversation = conversationData.find(v => v.conversation.e164 == route.params.e164)
        thisConversation?.messages.slice().reverse().forEach((v) => {
            ui.push(convertUI(v.message))
            // console.log(v)
        })
        setBubbles(ui)
    }, [conversationData])


    const headerItems: HeaderItems[] = [
        {
            label: 'dots-vertical',
            items: [
                {
                    label: 'Rời cuộc trò chuyện',
                    onPress: () => console.log('ok')
                },
                {
                    label: 'Tắt thông báo',
                    onPress: () => console.log('ok')
                }

            ]
        }
    ]

    const convertUI = (message: App.Types.MessageData): ChatItemProps => {
        return {
            kind: ChatItemKind.bubble,
            data: {
                content: message.data,
                type: toBubbleChatType(message.type),
                sentAt: message.timestamp,
                partner: (message.owner == App.MessageOwner.PARTNER) ? {
                    name: route.params.e164
                } : undefined
            }
        }
    }

    const sendMessageToServer = async function (
        localAddress: Signal.Types.SignalProtocolAddress,
        e164: string, message: App.Types.MessageData) {
        // console.log("startSendMessageToServer")
        const addresses = await getAddresses(e164)
        // console.log("addresses: ")
        // console.log(addresses)
        const missingSession = await SignalModule.missingSession(addresses)
        // console.log("missing: ")
        // console.log(missingSession)
        for (let index = 0; index < missingSession.length; index++) {
            const missing = missingSession[index];
            const preKeyBundle = await getPreKeyBundle(missing)
            const perform = await SignalModule.performKeyBundle(e164, preKeyBundle)
            console.log("performKeyBundle[" + preKeyBundle.deviceId + "]: " + perform)
            if (!perform) console.log(preKeyBundle)
        }

        for (let index = 0; index < addresses.length; index++) {
            const address = addresses[index];
            try {
                const cipher = await SignalModule.encrypt(address, message.data)
                const cipherMessage: Server.Message = {
                    data: cipher,
                    type: message.type,
                    timestamp: message.timestamp
                }

                const result = await outGoingMessage(localAddress, address, cipherMessage)
                // console.log("sendResult[" + address.deviceId + "]: " + result)
                if (result.sentAt === SocketEvent.SendAt.FAILED)
                    console.log("GUI TIN NHAN THAT BAI" + address)
            } catch (e) {
                console.log("[Mã hóa tin nhắn lỗi]: ")
                console.log(e)
            }

            // console.log("cipher[" + address.deviceId + "]: " + cipher)

        }

    }

    const addMessage = (message: App.Types.MessageData) => {
        const ui = convertUI(message)
        setBubbles((prevState) => [
            ui,
            ...prevState,
        ])
    }


    const saveMessageToLocal = async (message: App.Types.MessageData) => {
        AppModule.saveMessage(route.params.e164, message)
        // try {
        //     if (newConversation) {
        //         const conversationId = await AppModule.createConversation(route.params.e164, message)
        //         const loadMessage = await AppModule.loadMessage(route.params.e164)
        //         loadConversationWithMessages(loadMessage)
        //         console.log("new conversation: " + conversationId)
        //         setNewConversation(false)
        //     } else {
        //         AppModule.saveMessage(conversation!.id, message)
        //     }
        // } catch (e) {
        //     console.log(e)
        // }

    }

    const submit = async () => {
        const msg = message
        setMessage('')
        setConversationState(ConversationState.sending)
        const messageData: App.Types.MessageData = {
            data: msg,
            owner: App.MessageOwner.SELF,
            timestamp: formatISO(new Date()),
            type: App.MessageType.TEXT
        }
        addMessage(messageData)
        await sendMessageToServer(localAddress!, route.params.e164, messageData)
        await saveMessageToLocal(messageData)

        setConversationState(ConversationState.sent)

    }

    const scrollToBottom = () => {
        scrollRef.current?.scrollToEnd({ animated: true })
    }

    useEffect(() => {
        scrollToBottom()
    }, [bubbles])

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Header items={headerItems} />
            ),
            title: route.params.e164
        })
    }, [navigation])


    let scrollRef = useRef<ScrollView>(null)
    return (
        <SafeAreaView>
            <View style={{ gap: 5, flexDirection: 'column-reverse', alignItems: 'center', height: '100%' }}>
                <Portal>
                    <Modal visible={visibleEmoji} onDismiss={hideEmojiModal} contentContainerStyle={{
                        backgroundColor: 'white',
                        padding: 20,
                        margin: 20,
                        borderRadius: 20,
                    }}>

                    </Modal>
                </Portal>


                <View style={{ gap: 5, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 15, paddingBottom: 15, alignItems: 'center', alignContent: 'center' }}>
                    <TextInput label={'Nhập tin nhắn'} mode="outlined"
                        value={message}
                        style={{ flex: 1 }} onChangeText={onChangeMessage}
                        right={<TextInput.Icon onPress={submit} icon={'send'} color={(isTextInputFocused) => isTextInputFocused ? theme.colors.primary : 'transparent'} />}
                        left={<TextInput.Icon onPress={showEmojiModal} icon={'emoticon-happy'} color={(isTextInputFocused) => theme.colors.primary} />}
                    />
                    {/* { message.length > 0 && } */}
                </View>
                <Divider style={{ width: '100%' }} />

                <Chat items={bubbles} conversationState={conversationState} />



            </View>
        </SafeAreaView>
    )
}