import { Alert, Keyboard, SafeAreaView, TextInput as RNTextInput, ToastAndroid, View, KeyboardEvent, BackHandler } from "react-native";
import { Avatar, Button, Dialog, Divider, IconButton, List, Menu, Modal, Portal, Searchbar, Switch, Text, TextInput, useTheme } from "react-native-paper";
import { ChatZoneProps } from "..";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header, { HeaderItems } from "../../components/Header";
import ChatItem, { BubbleChat, BubbleChatType, ChatItemKind, ChatItemProps, toBubbleChatType } from "../../components/ChatItem";
import Chat, { ConversationState } from "../../components/Chat";
import { ScrollView } from "react-native";
import { formatISO } from "date-fns";
import { faker } from '@faker-js/faker';
import { App, Server, Signal, SocketEvent } from "../../../shared/types";
import SignalModule from "../../native/android/SignalModule";
import { el, ms } from "date-fns/locale";
import AppModule from "../../native/android/AppModule";
import { useAppSelector, useKeyboardHeight } from "../../hooks";
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Log from "../../utils/Log";
import { encryptAndSendMessage, saveMessageToLocal } from "../../utils/Messaging";
import { useColorScheme } from "react-native";
import { darkThemeWithoutRoundness, lightThemeWithoutRoundness } from "../../theme";
import { ChatController } from "../../components/ChatController";
import { MyAvatar } from "../../components/MyAvatar";
import { HeaderBackButton } from '@react-navigation/elements';
import PinCodeInput from "../../components/PinCodeInput";

const testMode = false

export default function ChatZone({ navigation, route }: ChatZoneProps): JSX.Element {
    const theme = useTheme()
    const [bubbles, setBubbles] = useState<ChatItemProps[]>([])
    const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.unknown)

    const [initializing, setInitializing] = useState<boolean>(true)
    const [localAddress, setLocalAddress] = useState<Signal.Types.SignalProtocolAddress>()

    const socketConnection = useAppSelector(state => state.socketConnection.value)

    const [visibleDialog, setVisibleDialog] = useState(false);

    const showDialog = () => setVisibleDialog(true);

    const hideDialog = () => setVisibleDialog(false);
    const [dialogData, setDialogData] = useState<App.Types.DialogData>({
        icon: 'information',
        title: '',
        content: ''
    })

    const [isSwitchOn, setIsSwitchOn] = useState(false);

    const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);


    // LOAD LOCAL ADDRESS
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

    useEffect(() => {
        const backAction = () => {
            navigation.popToTop()
            return true
        }
        const backHandler = BackHandler.addEventListener('hardwareBackPress',backAction)

        return () => backHandler.remove()
    },[])

    //  OBSERVE MESSAGE DATA
    const conversationData = useAppSelector(state => state.conversationData.value)

    useEffect(() => {
        const ui: Array<ChatItemProps> = []
        const thisConversation = conversationData.find(v => v.conversation.e164 == route.params.e164)
        thisConversation?.messages.slice().reverse().forEach((v) => {
            ui.push(convertUI(v.message))
            // console.log(v)
        })
        navigation.setOptions({
            title: thisConversation?.partner.nickname ?? thisConversation?.partner.name ?? route.params.e164,
            headerLeft: (props) => (
                <View style={{
                    flexDirection: 'row',
                    gap: 10,
                }}>
                    <HeaderBackButton {...props} />
                    <MyAvatar size={36} image={thisConversation?.partner.avatar} onPress={() => {
                        AppModule.getPartner(route.params.e164).then((partner) => {
                            if (partner !== null)
                                navigation.navigate('Partner', {
                                    partner: partner
                                })

                        }).catch((err) => {
                            Alert.alert("Không tìm thấy thông tin")
                            console.log(err)
                        })
                    }} />
                </View>
                
            ),
            headerRight: () => (
                <View style={{
                    flexDirection: 'row'
                }}>
                    {testMode ? <Switch value={isSwitchOn} onValueChange={onToggleSwitch} /> : null }
                    {/* <Header items={headerItems} /> */}
                    <IconButton icon={'dots-vertical'} onPress={() => {
                        const thisConversation = conversationData.find(v => v.conversation.e164 == route.params.e164)
                        navigation.navigate('ChatSetting', {
                            conversation: thisConversation!.conversation
                        })
                    }} />
                </View>
                
            ),
        })
        setBubbles(ui)
        const state = thisConversation?.state
        switch (state) {
            case App.MessageState.SENDING:
                setConversationState(ConversationState.sending)
                break;
            case App.MessageState.SENT:
                setConversationState(ConversationState.sent)
                break;
            case App.MessageState.ERROR:
                setConversationState(ConversationState.error)

            default:
                setConversationState(ConversationState.unknown)
                break;
        }
        if (thisConversation)
            AppModule.markAllPartnerMessageAsRead(thisConversation.conversation.id)
    }, [conversationData,isSwitchOn])

    const schema = useColorScheme()
    // const headerItems: HeaderItems[] = [
    //     {
    //         label: 'dots-vertical',
    //         items: [
    //             {
    //                 label: 'Xóa cuộc trò chuyện',
    //                 onPress: () => {
    //                     setDialogData({
    //                         icon: 'help',
    //                         title: `Bạn có chắc muốn xóa cuộc trò chuyện với ${route.params.e164} ?`,
    //                         content: `Dữ liệu trò chuyện này chỉ được xóa ở phía bạn và không thể khôi phục.`,
    //                         cancel: () => {
    //                             hideDialog()
    //                         },
    //                         ok: () => {
    //                             hideDialog()
    //                             AppModule.removeConversation(route.params.e164).then((v) => {
    //                                 if (v) {
    //                                     navigation.goBack()
    //                                     setDialogData({
    //                                         'icon': 'information',
    //                                         title: 'Xóa cuộc trò chuyện thành công',
    //                                         content: 'Dữ liệu trò chuyện đã được xóa'
    //                                     })
    //                                     showDialog()
    //                                 } else {
    //                                     setDialogData({
    //                                         'icon': 'alert',
    //                                         title: 'Xóa cuộc trò chuyện không thành công',
    //                                         content: 'Đã xảy ra lỗi, vui lòng thử lại'
    //                                     })
    //                                     showDialog()
    //                                 }
    //                             })
    //                         }
    //                     })
    //                     showDialog()
    //                 }
    //             },

    //         ]
    //     }
    // ]

    const convertUI = (message: App.Types.MessageData): ChatItemProps => {
        // partner will be undefined if this is a first message
        const partner = conversationData.find(v => v.conversation.e164 == route.params.e164)?.partner
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
                    name: partner?.nickname ?? partner?.name ?? route.params.e164,
                    avatar: partner?.avatar
                } : undefined,
            }
        }
    }


    const addPreMessage = (message: App.Types.MessageData) => {
        const ui = convertUI(message)
        setBubbles((prevState) => [
            ui,
            ...prevState,
        ])
    }


    const canSending = async (messageData: App.Types.MessageData, fileInfo?: Server.FileInfo) => {
        if (testMode && isSwitchOn) {
            SignalModule.testPerformance(messageData.data).then((result) => {
                Alert.alert("Kết quả hiệu suất:", result)
            })
            return
        }
        
        try {
            addPreMessage(messageData)
            let messageState = App.MessageState.SENDING
            setConversationState(ConversationState.sending)
            if (socketConnection) {
                const result = await encryptAndSendMessage(localAddress!, route.params.e164, messageData, fileInfo)
                if (result)
                    messageState = App.MessageState.SENT
                if (result == null) {
                    messageState = App.MessageState.ERROR
                    ToastAndroid.show("Người liên hệ không còn tồn tại trong hệ thống",1000)
                }
                    
            }
            await saveMessageToLocal(route.params.e164, messageData, messageState, fileInfo)
        } catch (e) {
            setConversationState(ConversationState.error)
            console.log(e)
        }
    }

    const handleText = async (msg: string) => {

        const messageData: App.Types.MessageData = {
            data: msg,
            owner: App.MessageOwner.SELF,
            timestamp: formatISO(new Date()),
            type: App.MessageType.TEXT,
            senderDevice: 0,
        }
        await canSending(messageData)
        // await encryptAndSendMessage(localAddress!, route.params.e164, messageData)
        // await saveMessageToLocal(messageData)
    }

    const handleSticker = async (sticker: string) => {
        const messageData: App.Types.MessageData = {
            data: sticker,
            owner: App.MessageOwner.SELF,
            timestamp: formatISO(new Date()),
            type: App.MessageType.STICKER,
            senderDevice: 0
        }
        await canSending(messageData)
    }

    const submitTextMessage = (message: string) => {
        if (message.length == 0) {
            ToastAndroid.show("Không thể gửi tin nhắn trống", ToastAndroid.SHORT)
            return
        }
        handleText(message)

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
                if (asset.fileSize > 10e6) {
                    ToastAndroid.show("Chỉ hỗ trợ gửi ảnh dưới 10MB",400)
                    return
                }
                   
                

                const fileInfo: Server.FileInfo = {
                    name: asset.fileName,
                    type: asset.type,
                    size: asset.fileSize,
                }

                const messageData: App.Types.MessageData = {
                    data: asset.uri,
                    owner: App.MessageOwner.SELF,
                    timestamp: formatISO(new Date()),
                    type: App.MessageType.IMAGE,
                    senderDevice: 0,
                }
                console.log("dang gui den server")
                await canSending(messageData, fileInfo)
            }
            else {
                console.log("Pick Image Failed")
            }
        }
    }

    const openImagePicker = async () => {
        // handleDismissModalPress()
        const result = await launchImageLibrary({
            mediaType: 'photo',
        })
        // console.log(result.assets)
        handleImage(result)

    }

    const openCamera = async () => {
        // handleDismissModalPress()
        const result = await launchCamera({
            mediaType: 'photo',
            includeBase64: true,
        })
        handleImage(result)
    }

    useEffect(() => {
        scrollToBottom()
    }, [bubbles])

    // useEffect(() => {
    //     navigation.setOptions({
    //         headerRight: () => (
    //             <Header items={headerItems} />
    //         ),
    //         title: route.params.e164
    //     })
    // }, [navigation])


    let scrollRef = useRef<ScrollView>(null)


    return (
        <SafeAreaView>
            <Portal>
                <Dialog visible={visibleDialog} style={{ borderRadius: 20 }} onDismiss={hideDialog} theme={schema == 'dark' ? darkThemeWithoutRoundness : lightThemeWithoutRoundness}>
                    <Dialog.Icon icon={dialogData.icon} />
                    <Dialog.Title>{dialogData.title}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">{dialogData.content}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            if (dialogData.cancel)
                                dialogData.cancel()
                            else
                                hideDialog()
                        }}>Hủy</Button>
                        <Button onPress={() => {
                            if (dialogData.ok)
                                dialogData.ok()
                            else
                                hideDialog()
                        }}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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

                <ChatController
                    onCameraPress={openCamera}
                    onGalleryPress={openImagePicker}
                    onSendPress={submitTextMessage}
                    onChooseSticker={handleSticker}
                />


                {/* <Divider style={{ width: '100%' }} /> */}

                <Chat items={bubbles} conversationState={conversationState} />



            </View>


            {/* </BottomSheetModalProvider> */}

        </SafeAreaView>
    )
}