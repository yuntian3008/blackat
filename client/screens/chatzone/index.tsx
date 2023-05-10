import { Alert, Keyboard, SafeAreaView, TextInput as RNTextInput, ToastAndroid, View } from "react-native";
import { Avatar, Button, Divider, IconButton, List, Menu, Modal, Portal, Searchbar, Text, TextInput, useTheme } from "react-native-paper";
import { ChatZoneProps } from "..";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import BottomSheet, { BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import Log from "../../utils/Log";



export default function ChatZone({ navigation, route }: ChatZoneProps): JSX.Element {
    const theme = useTheme()
    const [message, setMessage] = useState<string>('');
    const [isTextInputFocused, setIsTextInputFocused] = useState<boolean>(false);
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
                    label: 'Xóa trò chuyện',
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
                onPress: message.type === App.MessageType.IMAGE ? () => {
                    navigation.navigate('ImageView', {
                        uri: message.data
                    })
                } : undefined,
                type: toBubbleChatType(message.type),
                sentAt: message.timestamp,
                partner: (message.owner == App.MessageOwner.PARTNER) ? {
                    name: route.params.e164
                } : undefined
            }
        }
    }

    const syncSession = async function (e164: string) {
        const addresses = await getAddresses(e164)
        const missingSession = await SignalModule.missingSession(addresses)
        for (let index = 0; index < missingSession.length; index++) {
            const missing = missingSession[index];
            const preKeyBundle = await getPreKeyBundle(missing)
            const perform = await SignalModule.performKeyBundle(e164, preKeyBundle)
            console.log("performKeyBundle[" + preKeyBundle.deviceId + "]: " + perform)
            if (!perform) console.log(preKeyBundle)
        }
        return addresses
    }

    const sendMessageToServer = async function (
        localAddress: Signal.Types.SignalProtocolAddress,
        e164: string, message: App.Types.MessageData, fileInfo?: Server.FileInfo) {
        // console.log("startSendMessageToServer")
        const addresses = await syncSession(e164)

        for (let index = 0; index < addresses.length; index++) {
            const address = addresses[index];
            let cipher
            if (fileInfo !== undefined) {
                cipher = await SignalModule.encryptFile(address, message.data)
            }
            else {
                cipher = await SignalModule.encrypt(address, message.data)
            }
            const cipherMessage: Server.Message = {
                data: cipher,
                type: message.type,
                timestamp: message.timestamp,
                fileInfo: fileInfo
            }

            const result = await outGoingMessage(localAddress, address, cipherMessage)
            console.log(result)
            // console.log("sendResult[" + address.deviceId + "]: " + result)
            if (result.sentAt === SocketEvent.SendAt.FAILED)
                console.log("GUI TIN NHAN THAT BAI" + address)
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
        try {
            await AppModule.saveMessage(route.params.e164, message)
        }
        catch (e) { console.log(e) }
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

    const handleSubmit = async (msg: string, type: number) => {
        setConversationState(ConversationState.sending)
        const messageData: App.Types.MessageData = {
            data: msg,
            owner: App.MessageOwner.SELF,
            timestamp: formatISO(new Date()),
            type: type
        }
        addMessage(messageData)
        await sendMessageToServer(localAddress!, route.params.e164, messageData)
        await saveMessageToLocal(messageData)

        setConversationState(ConversationState.sent)
    }

    const submit = () => {
        if (message.length == 0) ToastAndroid.show("Không thể gửi tin nhắn trống", ToastAndroid.SHORT)
        const msg = message
        setMessage('')
        handleSubmit(msg, App.MessageType.TEXT)

    }

    const scrollToBottom = () => {
        scrollRef.current?.scrollToEnd({ animated: true })
    }

    const handleImage = async (result: ImagePickerResponse) => {
        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0]

            const path = asset.fileName?.replace("rn_image_picker_lib_temp_", "")
            if (asset.fileName && asset.type && asset.fileSize && asset.uri) {
                // const fileType = path.split('.').pop()
                // const fileName = path.split('.').shift()

                const fileInfo: Server.FileInfo = {
                    name: asset.fileName,
                    type: asset.type,
                    size: asset.fileSize,
                }

                setConversationState(ConversationState.sending)
                const messageData: App.Types.MessageData = {
                    data: asset.uri,
                    owner: App.MessageOwner.SELF,
                    timestamp: formatISO(new Date()),
                    type: App.MessageType.IMAGE
                }
                addMessage(messageData)
                console.log("dang gui den server")
                await sendMessageToServer(localAddress!, route.params.e164, messageData, fileInfo)
                await saveMessageToLocal(messageData)

                setConversationState(ConversationState.sent)
            }
            else {
                console.log("Pick Image Failed")
            }
        }
    }

    const openImagePicker = async () => {
        // handleDismissModalPress()
        closeMenu()
        const result = await launchImageLibrary({
            mediaType: 'photo',
            includeBase64: true,
        })
        handleImage(result)

    }

    const openCamera = async () => {
        // handleDismissModalPress()
        closeMenu()
        const result = await launchCamera({
            mediaType: 'photo',
            includeBase64: true,
        })
        handleImage(result)
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


    // const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    // const messageInputRef = useRef<RNTextInput>(null);

    // variables
    // const snapPoints = useMemo(() => ['50%', '50%'], []);

    // callbacks
    // const handlePresentModalPress = useCallback(() => {
    //     bottomSheetModalRef.current?.present();
    // }, []);
    // const handleDismissModalPress = useCallback(() => {
    //     bottomSheetModalRef.current?.dismiss();
    // }, []);
    // const handleSheetChanges = useCallback((index: number) => {
    //     if (index < 0)
    //         messageInputRef.current?.focus()
    //     else
    //         messageInputRef.current?.blur()
    //     console.log('handleSheetChanges', index);
    // }, []);

    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);

    const closeMenu = () => setVisible(false);

    const color = useTheme()

    return (
        <SafeAreaView>
            {/* // <BottomSheetModalProvider> */}
            <View style={{ gap: 5, flexDirection: 'column-reverse', alignItems: 'center', height: '100%' }}>
                {
                    /* <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={1}
                        snapPoints={snapPoints}
                        onChange={handleSheetChanges}
                    >
                        <BottomSheetView
                            style={{
                                zIndex: 20,
                                flexDirection: 'column',
                                padding: 10,
                                gap: 10,
                            }}>
                            <Text variant="labelLarge" style={{
                                fontWeight: 'bold'
                            }}>Chọn hình ảnh</Text>
                            <Button
                                mode="contained"
                                icon="camera"
                                onPress={openCamera}
                            >Chụp ảnh</Button>
                            <Button
                                mode="contained"
                                icon="image"
                                onPress={openImagePicker}
                            >Thư viện</Button>
                        </BottomSheetView>
                    </BottomSheetModal> */
                }


                <View style={{ gap: 5, borderTopWidth: 0.5, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 15, paddingVertical: 10, alignItems: 'center', alignContent: 'center' }}>
                    <Menu
                        visible={visible}
                        onDismiss={closeMenu}
                        anchorPosition="top"
                        anchor={<IconButton size={28} style={{ }} mode="contained" onPress={openMenu} icon={'camera-image'} />}>
                        <Menu.Item onPress={openCamera} leadingIcon={'camera'} title="Máy ảnh" />
                        <Menu.Item onPress={openImagePicker} leadingIcon={'image'} title="Thư viện" />
                    </Menu>
                    <TextInput label={'Nhập tin nhắn'} mode="outlined"
                        placeholder="Nhập tin nhắn"
                        // ref={messageInputRef}
                        // autoFocus={true}
                        value={message}
                        style={{
                            flex: 1,
                            zIndex: 10,
                        }}
                        onChangeText={onChangeMessage}
                        onFocus={() => {
                            setIsTextInputFocused(!isTextInputFocused)
                        }}
                        right={(message.length > 0)
                            ?
                            <TextInput.Icon onPress={submit} icon={'send'} color={() => theme.colors.primary} />
                            :
                            <TextInput.Icon onPress={() => ToastAndroid.show("Sắp ra mắt", ToastAndroid.SHORT)} icon={'paperclip'} color={() => theme.colors.primary} />
                            // <TextInput.Icon onPress={handleCamera} icon={'camera'} color={() => theme.colors.primary} />

                        }
                        left={<TextInput.Icon onPress={() => ToastAndroid.show("Sắp ra mắt", ToastAndroid.SHORT)} icon={'sticker-emoji'} color={(isTextInputFocused) => theme.colors.primary} />}
                    />

                    {/* { message.length > 0 && } */}
                </View>
                {/* <Divider style={{ width: '100%' }} /> */}

                <Chat items={bubbles} conversationState={conversationState} />



            </View>


            {/* </BottomSheetModalProvider> */}

        </SafeAreaView>
    )
}