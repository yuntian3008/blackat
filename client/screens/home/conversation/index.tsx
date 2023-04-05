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



function Conversation({ navigation }: ConversationProps): JSX.Element {
    const theme = useTheme()
    const conversations: ConversationData[] = [
        {
            onPress: () => navigation.getParent()?.navigate('ChatZone', {
                conversationName: 'Alex'
            }),
            name: "Alex",
            lastMessage: "Xin chào",
            lastDateTime: "11:29",
            self: true,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=D98D63&i=3337d17d1f7d148640bddfe445bb06b4"
        },
        {
            onPress: async () => {
                const { SignalModule } = NativeModules 
                const test = await SignalModule.testDatabase()
                console.log(test)
                Alert.alert('info',test)
                // SignalModule.setIdentityKeyPair(test)
            },
            name: "Lộc Trần",
            lastMessage: "Tối nay hẹn gặp chỗ cũ",
            lastDateTime: "11/03/2023",
            ting: 2,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=63C8D9&i=2ea54aaed1aee8357bc0c85670ea888b"
        },
        {
            onPress: () => console.log('a'),
            name: "Thông Nguyễn",
            lastMessage: "Tất cả mã sẽ được auto tự động .Tránh trường hợp không mua gói mà tải hoặc từ web khác qua đây Cảm ơn ! ",
            lastDateTime: "Hôm qua",
            ting: 1,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=7463D9&i=e488b341e08a626073e3dabf8294b347"
        },
        {
            onPress: () => console.log('a'),
            name: "Alex",
            lastMessage: "Xin chào",
            lastDateTime: "11:29",
            self: true,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=D98D63&i=3337d17d1f7d148640bddfe445bb06b4"
        },
        {
            onPress: () => console.log('a'),
            name: "Lộc Trần",
            lastMessage: "Tối nay hẹn gặp chỗ cũ",
            lastDateTime: "11/03/2023",
            ting: 2,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=63C8D9&i=2ea54aaed1aee8357bc0c85670ea888b"
        },
        {
            onPress: () => console.log('a'),
            name: "Thông Nguyễn",
            lastMessage: "Tất cả mã sẽ được auto tự động .Tránh trường hợp không mua gói mà tải hoặc từ web khác qua đây Cảm ơn ! ",
            lastDateTime: "Hôm qua",
            ting: 1,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=7463D9&i=e488b341e08a626073e3dabf8294b347"
        },
        {
            onPress: () => console.log('a'),
            name: "Alex",
            lastMessage: "Xin chào",
            lastDateTime: "11:29",
            self: true,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=D98D63&i=3337d17d1f7d148640bddfe445bb06b4"
        },
        {
            onPress: () => console.log('a'),
            name: "Lộc Trần",
            lastMessage: "Tối nay hẹn gặp chỗ cũ",
            lastDateTime: "11/03/2023",
            ting: 2,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=63C8D9&i=2ea54aaed1aee8357bc0c85670ea888b"
        },
        {
            onPress: () => console.log('a'),
            name: "Thông Nguyễn",
            lastMessage: "Tất cả mã sẽ được auto tự động .Tránh trường hợp không mua gói mà tải hoặc từ web khác qua đây Cảm ơn ! ",
            lastDateTime: "Hôm qua",
            ting: 1,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=7463D9&i=e488b341e08a626073e3dabf8294b347"
        },
        {
            onPress: () => console.log('a'),
            name: "Alex",
            lastMessage: "Xin chào",
            lastDateTime: "11:29",
            self: true,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=D98D63&i=3337d17d1f7d148640bddfe445bb06b4"
        },
        {
            onPress: () => console.log('a'),
            name: "Lộc Trần",
            lastMessage: "Tối nay hẹn gặp chỗ cũ",
            lastDateTime: "11/03/2023",
            ting: 2,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=63C8D9&i=2ea54aaed1aee8357bc0c85670ea888b"
        },
        {
            onPress: () => console.log('a'),
            name: "Thông Nguyễn",
            lastMessage: "Tất cả mã sẽ được auto tự động .Tránh trường hợp không mua gói mà tải hoặc từ web khác qua đây Cảm ơn ! ",
            lastDateTime: "Hôm qua",
            ting: 1,
            image: "https://doodleipsum.com/700x700/avatar-3?bg=7463D9&i=e488b341e08a626073e3dabf8294b347"
        },
    ];



    return (
        <SafeAreaView>

            {/* UI kittin + style */}
            <ScrollView >
                <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    {
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
        </SafeAreaView>
    )
}

export default Conversation