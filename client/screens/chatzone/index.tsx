import { Alert, SafeAreaView, View } from "react-native";
import { Avatar, Divider, IconButton, List, Menu, Modal, Portal, Searchbar, Text, TextInput, useTheme } from "react-native-paper";
import { ChatZoneProps } from "..";
import { useEffect, useRef, useState } from "react";
import Header, { HeaderItems } from "../../components/Header";
import ChatItem, { BubbleChat, BubbleChatType, ChatItemKind, ChatItemProps } from "../../components/ChatItem";
import Chat, { ConversationState } from "../../components/Chat";
import { ScrollView } from "react-native";
import { formatISO } from "date-fns";
import { faker } from '@faker-js/faker';


export default function ChatZone({ navigation, route }: ChatZoneProps): JSX.Element {
    const theme = useTheme()
    const [message, setMessage] = useState<string>('');
    const [partnerIsTyping, setPartnerIsTyping] = useState<string[]>([
    ])
    const [bubbles, setBubbles] = useState<ChatItemProps[]>([])
    const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.unknown)
    const [visibleEmoji, setVisibleEmoji] = useState<boolean>(false)

    const onChangeMessage = (message: string) => setMessage(message);
    const showEmojiModal = () => setVisibleEmoji(true);
    const hideEmojiModal = () => setVisibleEmoji(false);


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



    const randomReply = async () => {
        setPartnerIsTyping([
            'https://doodleipsum.com/700x700/avatar?i=f09941a6f1650d51929781a86c6a8411'
        ])
        await await new Promise((res: any) => setTimeout(res, 1000));
        setPartnerIsTyping([])
        addMessage({
            partner: {
                avatar: 'https://doodleipsum.com/700x700/avatar?i=f09941a6f1650d51929781a86c6a8411',
                name: 'Alex'
            },
            content: faker.lorem.paragraph(),
            sentAt: formatISO(new Date()),
            type: BubbleChatType.text,
            onPress: () => { },
            onLongPress: () => { }
        })
    }

    const addMessage = (message: BubbleChat) => {
        setBubbles((prevState) => [
            {
                kind: ChatItemKind.bubble,
                data: message
            },
            ...prevState,
        ])
    }

    const send = async () => {
        const msg = message
        setMessage('')
        setConversationState(ConversationState.sending)
        addMessage({
            content: msg,
            sentAt: formatISO(new Date()),
            type: BubbleChatType.text,
            onPress: () => { },
            onLongPress: () => { }
        })

        await await new Promise((res: any) => setTimeout(res, 1000));
        setConversationState(ConversationState.sent)
        if (msg !== 'Nín')
            randomReply()
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
            title: route.params.conversationName
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
                        right={<TextInput.Icon onPress={send} icon={'send'} color={(isTextInputFocused) => isTextInputFocused ? theme.colors.primary : 'transparent'} />}
                        left={<TextInput.Icon onPress={showEmojiModal} icon={'emoticon-happy'} color={(isTextInputFocused) => theme.colors.primary } />}
                    />
                    {/* { message.length > 0 && } */}
                </View>
                <Divider style={{ width: '100%' }} />

                <Chat items={bubbles} conversationState={conversationState} partnerIsTyping={partnerIsTyping} />



            </View>
        </SafeAreaView>
    )
}