import { Layout } from "@ui-kitten/components";
import { Alert, NativeModules, SafeAreaView, ScrollView, View } from "react-native";
import auth from '@react-native-firebase/auth';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ConversationProps } from "../..";
import { Avatar, Badge, Button, FAB, List, Text, TouchableRipple, useTheme } from "react-native-paper";
import ConversationItem, { Conversation as ConversationData } from "../../../components/ConversationItem";
import { LoremIpsum } from "lorem-ipsum";
import DeviceInfo from 'react-native-device-info';
import socket from "../../../utils/socket";
import { LoadingOverlay } from "../../../components/Utils";
import { useEffect, useState } from "react";
import AppModule from "../../../native/android/AppModule";
import EmptyItem from "../../../components/EmptyItem";
import { useAppSelector } from "../../../hooks";
import { App } from "../../../../shared/types";



function Conversation({ navigation }: ConversationProps): JSX.Element {

    const [loading, setLoading] = useState<boolean>(false)
    const [conversations, setConversations] = useState<Array<ConversationData> | null>(null)
    const theme = useTheme()

    const conversationData = useAppSelector(state => state.conversationData.value)

    useEffect(() => {
        const ui: Array<ConversationData> = []
        conversationData.forEach((v) => {
            if (v.messages.length > 0) {
                const lastMessage = v.messages[v.messages.length - 1].message
                ui.push({
                    name: v.conversation.e164,
                    lastDateTime: lastMessage.timestamp,
                    lastMessage: lastMessage.type == App.MessageType.TEXT ? lastMessage.data : "...",
                    onPress: () => navigation.getParent()?.navigate('ChatZone', {
                        e164: v.conversation.e164
                    }),
                })
            }

        })
        setConversations(ui)
    }, [conversationData])
    // useEffect(() => {

    //     if (conversations === null) {
    //         setLoading(true)
    //         const conversationData: Array<ConversationData> = new Array()
    //         AppModule.getConversationList().then((v) => {
    //             v.forEach((v) => {
    //                 conversationData.push({
    //                     name: v.e164,
    //                     lastDateTime: 'lastDateTime',
    //                     lastMessage: 'lastMessage',
    //                 })
    //             })
    //             setConversations(conversationData)
    //         })
    //     }
    //     else
    //         setLoading(false)
    // }, [conversations])
    // const conversations: ConversationData[] = [
    //     {
    //         onPress: () => navigation.getParent()?.navigate('ChatZone', {
    //             conversationName: 'Alex'
    //         }),
    //         name: "Alex",
    //         lastMessage: "Xin chào",
    //         lastDateTime: "11:29",
    //         self: true,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=D98D63&i=3337d17d1f7d148640bddfe445bb06b4"
    //     },
    //     {
    //         onPress: async () => {
    //             socket.emit('outGoingMessage',{
    //                 cipherMessage: '',
    //                 deviceId: 1,
    //                 e164: ''
    //             },(r) => {

    //             })
    //             // setLoading(true)
    //             // const identityKey = await SignalModule.requireIdentityKey()
    //             // const oneTime = await SignalModule.requireOneTimePreKey()
    //             // const signed = await SignalModule.requireSignedPreKey()
    //             // // const count = await SignalModule.checkIntegrity(result)
    //             // const verify = await SignalModule.performKeyBundle({
    //             //     deviceId: 1,
    //             //     registrationId: 1,
    //             //     preKeyId: oneTime[0].id as number,
    //             //     preKey: oneTime[0].key as string,
    //             //     signedPreKeyId: signed.id as number,
    //             //     signedPreKey: signed.key as string,
    //             //     singedPreKeySignature: signed.signature as string,
    //             //     identityKey: identityKey as string

    //             // })
    //             // setLoading(false)
    //             // console.log(identityKey)
    //             // console.log(oneTime)
    //             // console.log(signed)
    //             // console.log(verify)
    //             // AAA-BBB-CCC-DDD
    //         },
    //         name: "Lộc Trần",
    //         lastMessage: "Tối nay hẹn gặp chỗ cũ",
    //         lastDateTime: "11/03/2023",
    //         ting: 2,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=63C8D9&i=2ea54aaed1aee8357bc0c85670ea888b"
    //     },
    //     {
    //         onPress: () => console.log('a'),
    //         name: "Thông Nguyễn",
    //         lastMessage: "Tất cả mã sẽ được auto tự động .Tránh trường hợp không mua gói mà tải hoặc từ web khác qua đây Cảm ơn ! ",
    //         lastDateTime: "Hôm qua",
    //         ting: 1,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=7463D9&i=e488b341e08a626073e3dabf8294b347"
    //     },
    //     {
    //         onPress: () => console.log('a'),
    //         name: "Alex",
    //         lastMessage: "Xin chào",
    //         lastDateTime: "11:29",
    //         self: true,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=D98D63&i=3337d17d1f7d148640bddfe445bb06b4"
    //     },
    //     {
    //         onPress: () => console.log('a'),
    //         name: "Lộc Trần",
    //         lastMessage: "Tối nay hẹn gặp chỗ cũ",
    //         lastDateTime: "11/03/2023",
    //         ting: 2,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=63C8D9&i=2ea54aaed1aee8357bc0c85670ea888b"
    //     },
    //     {
    //         onPress: () => console.log('a'),
    //         name: "Thông Nguyễn",
    //         lastMessage: "Tất cả mã sẽ được auto tự động .Tránh trường hợp không mua gói mà tải hoặc từ web khác qua đây Cảm ơn ! ",
    //         lastDateTime: "Hôm qua",
    //         ting: 1,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=7463D9&i=e488b341e08a626073e3dabf8294b347"
    //     },
    //     {
    //         onPress: () => console.log('a'),
    //         name: "Alex",
    //         lastMessage: "Xin chào",
    //         lastDateTime: "11:29",
    //         self: true,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=D98D63&i=3337d17d1f7d148640bddfe445bb06b4"
    //     },
    //     {
    //         onPress: () => console.log('a'),
    //         name: "Lộc Trần",
    //         lastMessage: "Tối nay hẹn gặp chỗ cũ",
    //         lastDateTime: "11/03/2023",
    //         ting: 2,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=63C8D9&i=2ea54aaed1aee8357bc0c85670ea888b"
    //     },
    //     {
    //         onPress: () => console.log('a'),
    //         name: "Thông Nguyễn",
    //         lastMessage: "Tất cả mã sẽ được auto tự động .Tránh trường hợp không mua gói mà tải hoặc từ web khác qua đây Cảm ơn ! ",
    //         lastDateTime: "Hôm qua",
    //         ting: 1,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=7463D9&i=e488b341e08a626073e3dabf8294b347"
    //     },
    //     {
    //         onPress: () => console.log('a'),
    //         name: "Alex",
    //         lastMessage: "Xin chào",
    //         lastDateTime: "11:29",
    //         self: true,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=D98D63&i=3337d17d1f7d148640bddfe445bb06b4"
    //     },
    //     {
    //         onPress: () => console.log('a'),
    //         name: "Lộc Trần",
    //         lastMessage: "Tối nay hẹn gặp chỗ cũ",
    //         lastDateTime: "11/03/2023",
    //         ting: 2,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=63C8D9&i=2ea54aaed1aee8357bc0c85670ea888b"
    //     },
    //     {
    //         onPress: () => console.log('a'),
    //         name: "Thông Nguyễn",
    //         lastMessage: "Tất cả mã sẽ được auto tự động .Tránh trường hợp không mua gói mà tải hoặc từ web khác qua đây Cảm ơn ! ",
    //         lastDateTime: "Hôm qua",
    //         ting: 1,
    //         image: "https://doodleipsum.com/700x700/avatar-3?bg=7463D9&i=e488b341e08a626073e3dabf8294b347"
    //     },
    // ];



    return (
        <SafeAreaView>
            {loading && <LoadingOverlay />}
            {/* UI kittin + style */}
            <View style={{ height: '100%', }}>
                <ScrollView>
                    <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                        {
                            (conversations === null || conversations?.length == 0) ?
                                <EmptyItem message="Không có cuộc trò chuyện nào" />
                                :
                                conversations.map((conversation, index) =>
                                    <ConversationItem {...conversation} key={index} />
                                )
                        }
                    </View>

                </ScrollView>
                <FAB
                    onPress={() => navigation.getParent()?.navigate('NewContact')}
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