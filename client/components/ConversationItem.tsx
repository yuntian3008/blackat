import { format, isToday, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { Button as NativeButton, Pressable, PressableProps, TouchableNativeFeedback, TouchableOpacity, View } from "react-native"
import { Avatar, Badge, List, Text, TouchableRipple, useTheme } from "react-native-paper"
import { MyAvatar } from "./MyAvatar"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export type Conversation = {
    name: string,
    lastMessage: string,
    lastDateTime: string,
    ting?: number,
    image?: string,
    self?: boolean,
    onPress?: () => void,
    onImagePress?: () => void,
    onLongPress?: () => void,
    isPinSecurity?: boolean
}

const displaySentAt = (sentAt: string): string => {
    const date = parseISO(sentAt)
    const dateFormat = isToday(date) ? "HH:mm" : "dd/MM/yyyy"
    return format(date, dateFormat, { locale: vi })
}

export default function ConversationItem({
    name,
    lastMessage,
    lastDateTime,
    ting,
    image,
    self,
    onPress,
    onImagePress,
    onLongPress,
    isPinSecurity
}: Conversation): JSX.Element {
    const theme = useTheme()
    return (
        <List.Item
            onPress={onPress}
            onLongPress={onLongPress}
            rippleColor={theme.colors.elevation.level2}
            style={{ width: "100%", paddingHorizontal: 20 }}
            title={name}
            titleStyle={{
                fontSize: 17
            }}
            descriptionStyle={{
                fontSize: 15,
                alignItems: 'flex-end',
                fontWeight: ting !== undefined && ting > 0 ? 'bold' : 'normal'
            }}
            descriptionNumberOfLines={1}
            description={isPinSecurity ? "[Tin nhắn]" : lastMessage}
            right={props => (
                <View style={{
                    padding: 0,
                    margin: 0,
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    {
                        isPinSecurity ? 
                        <Icon name="lock-outline" size={20} color={theme.colors.primary}/>
                        : <Text>{displaySentAt(lastDateTime)}</Text>
                    }
                    
                    {
                        (ting !== undefined && ting > 0 && !isPinSecurity) ?
                            <Badge style={{ backgroundColor: theme.colors.tertiary }}>{ting}</Badge> :
                            null
                    }
                </View>
            )}
            left={props =>
                <MyAvatar size={48} image={image} onPress={onImagePress} />
            }
        />
        // </TouchableRipple>
    )
}