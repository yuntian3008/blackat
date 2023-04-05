import { PressableProps, View } from "react-native"
import { Avatar, Badge, List, Text, TouchableRipple, useTheme } from "react-native-paper"

export type Conversation = {
    name: string,
    lastMessage: string,
    lastDateTime: string,
    ting?: number,
    image: string,
    self?: boolean
    onPress?: () => void,
    onLongPress?: () => void,
}

export default function ConversationItem({
    name,
    lastMessage,
    lastDateTime,
    ting,
    image,
    self,
    onPress,
    onLongPress,
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
                    fontWeight: ting ? '600' : 'normal'
                }}
                descriptionNumberOfLines={1}
                description={lastMessage}
                right={props => (
                    <View style={{
                        padding: 0,
                        margin: 0,
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <Text>{lastDateTime}</Text>
                        {ting && <Badge style={{ backgroundColor: theme.colors.tertiary }}>{ting}</Badge>}
                    </View>
                )}
                left={props => <Avatar.Image size={48} source={{ uri: image }} />}
            />
        // </TouchableRipple>
    )
}