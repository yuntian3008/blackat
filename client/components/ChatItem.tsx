import { PressableProps, StyleSheet, View } from "react-native"
import { Avatar, Badge, Button, Card, Chip, List, Text, TouchableRipple, useTheme } from "react-native-paper"
import { ConversationState } from "./Chat"
import { format, isToday, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { TypingAnimation } from 'react-native-typing-animation';
import { App } from "../../shared/types"

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

export enum BubbleChatType {
    text,
    image,
    file,
    video,
    unknown
}

export function toBubbleChatType(type: number): BubbleChatType {
    switch (type) {
        case App.MessageType.TEXT:
            return BubbleChatType.text
        case App.MessageType.IMAGE:
            return BubbleChatType.image

        default:
            return BubbleChatType.unknown
    }
}

export type Partner = {
    avatar?: string,
    name: string,
}

export type BubbleChat = {
    content: string,
    type: BubbleChatType,
    conversationState?: ConversationState,
    sentAt: string,
    partner?: Partner
    onPress?: () => void,
    onLongPress?: () => void,
}

const StateBadge = ({ state }: { state: ConversationState }): JSX.Element => {
    let bg
    let icon
    switch (state) {
        case ConversationState.sending:
            bg = 'transparent'
            icon = 'clock'
            break;
        case ConversationState.sent:
            bg = 'transparent'
            icon = 'check'
            break;
        case ConversationState.received:
            bg = useTheme().colors.tertiary
            icon = 'check'
            break;
        case ConversationState.seen:
            bg = useTheme().colors.tertiary
            icon = 'check-all'
            break;
        default:
            bg = null
            icon = null
    }
    if (bg == null || icon == null) return <></>
    return (
        <Avatar.Icon
            style={{ backgroundColor: bg, borderWidth: 1, margin: 1, borderColor: useTheme().colors.tertiary }}
            color={bg == 'transparent' ? useTheme().colors.tertiary : undefined}
            icon={icon}
            size={16}
        />
    )
}

export const BubbleChat = ({ content, type, conversationState, sentAt, partner, onPress, onLongPress }: BubbleChat): JSX.Element => {
    const showSelfState: boolean = (partner === undefined && conversationState !== undefined)

    const bubbleStyle = StyleSheet.create({
        selfStyle: {
            backgroundColor: useTheme().colors.primaryContainer
        }
    })

    const displaySentAt = (): string => {
        const date = parseISO(sentAt)
        const dateFormat = isToday(date) ? "HH:mm" : "dd/MM/yyyy"
        return format(date, dateFormat, { locale: vi })
    }

    return (
        <View style={{
            paddingTop: 12,
            width: '100%',
            paddingHorizontal: 20,
            flexDirection: !partner ? 'row-reverse' : 'row',
        }}>
            <View style={{
                gap: 2,
                flexDirection: 'column',
                maxWidth: '70%',
            }}>
                {partner && (
                    partner.avatar ?
                        <Avatar.Image
                            size={28}
                            source={{ uri: partner.avatar }}
                            style={{
                                position: 'absolute',
                                top: -12,
                                left: -12,
                                zIndex: 1
                            }} /> :
                        <Avatar.Icon size={28}
                            icon={"account"}
                            style={{
                                position: 'absolute',
                                top: -12,
                                left: -12,
                                zIndex: 1
                            }} />)}

                <Card
                    onPress={onPress}
                    onLongPress={onLongPress}
                    mode="contained"
                    style={[
                        {
                            borderRadius: 20,
                        },
                        !partner && bubbleStyle.selfStyle
                    ]
                    }
                >
                    {(() => {
                        switch (type) {
                            case BubbleChatType.text:
                                return (
                                    <Card.Content style={{ flexDirection: 'column' }}>
                                        {partner && <Text variant="labelLarge" style={{ fontWeight: 'bold' }}>{partner.name}</Text>}
                                        <Text variant="bodyMedium">{content}</Text>
                                    </Card.Content>
                                )
                            case BubbleChatType.image:
                                return (
                                    <Card.Cover source={{ uri: content }} />
                                )
                            default:
                                return null
                        }
                    })()}

                </Card>
                <View style={{
                    gap: 5,
                    // width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexDirection: !partner ? 'row-reverse' : 'row',
                }}>

                    <View>{
                        showSelfState &&
                        <StateBadge state={conversationState!} />
                    }
                    </View>
                    <Text variant="labelSmall">{displaySentAt()}</Text>
                </View>

            </View>

        </View>
    )
}

export type TypingProps = {
    images: string[]
}

const Typing = ({ images }: TypingProps): JSX.Element => {
    if (images === undefined || images.length == 0) return <></>
    return (
        <View style={{
            paddingTop: 12,
            width: '100%',
            paddingHorizontal: 20,
            flexDirection: 'row',
        }}>
            <View style={{
                gap: 2,
                flexDirection: 'column',
                maxWidth: '70%',
            }}>
                {images.map((img, index) => (
                    <Avatar.Image size={28} source={{ uri: img }} style={{
                        position: 'absolute',
                        top: -12,
                        left: -12 + (images.length - index) * 14,
                        zIndex: index + 1,
                    }} key={index} />
                ))}


                <Card
                    mode="contained"
                    style={[
                        {
                            borderRadius: 20,
                        },
                    ]
                    }
                >
                    <Card.Content style={{ flexDirection: 'column' }}>
                        <Text variant="labelSmall">Đang soạn tin...</Text>
                    </Card.Content>

                </Card>
            </View>

        </View>
    )
}



export enum ChatItemKind {
    bubble,
    typing
}

export type ChatItemProps = {
    kind: ChatItemKind,
    data: BubbleChat | string[]
}


export default function ChatItem({
    kind,
    data
}: ChatItemProps): JSX.Element {
    switch (kind) {
        case ChatItemKind.bubble:
            return <BubbleChat {...data as BubbleChat} />
        case ChatItemKind.typing:
            return <Typing images={data as string[]} />
    }
}