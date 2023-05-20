import { FlatList, View } from "react-native"
import ChatItem, { BubbleChat, ChatItemKind, ChatItemProps } from "./ChatItem"
import { useEffect, useState } from "react"
import { compareAsc, compareDesc, parseISO } from "date-fns"

export enum ConversationState {
    sending,
    sent,
    received,
    seen,
    unknown,
    error
}

export type ChatProps = {
    items: ChatItemProps[],
    conversationState: ConversationState,
    partnerIsTyping?: string[],
}

export default function Chat({
    items,
    conversationState,
    partnerIsTyping
}: ChatProps): JSX.Element {
    // const firstBubbleIndex = items.findIndex(({ kind }) => kind === ChatItemKind.bubble)
    /**
     * @todo typing mode
     * below
     */

    // items.unshift({
    //     kind: ChatItemKind.typing,
    //     data: partnerIsTyping,
    // })

    useEffect(() => {
        setLength(items.length)
    }, [items])

    const [length, setLength] = useState<number>()

    return (
        <View style={{ gap: 5, flexDirection: 'column-reverse', width: '100%', flex:1 }}>
            <FlatList
                inverted
                // showsVerticalScrollIndicator={false}
                data={items.sort((a, b) => {
                    return compareDesc(parseISO(a.data.sentAt), parseISO(b.data.sentAt))
                })}
                // ListHeaderComponent={
                //     partnerIsTyping !== undefined ? <ChatItem kind={ChatItemKind.typing} data={partnerIsTyping} /> : undefined
                // }
                renderItem={({ item, index, separators }) => {

                    if (item.kind === ChatItemKind.bubble) {
                        return <BubbleChat conversationState={((items.length - index) === length) ? conversationState : undefined} {...item.data as BubbleChat} />
                    }


                    return (
                        <ChatItem {...item} key={index} />
                    )
                }}
                extraData={length}
            />
            {/* <ChatItem typing={[
                'https://doodleipsum.com/700x700/avatar?i=6c1d81eb757d911acaef34ead7dfd392',
                'https://doodleipsum.com/700x700/avatar?i=854652f6a35c1383f4d5fcf6e59bea81',
                'https://doodleipsum.com/700x700/avatar?i=9faa1a7b9183f32cc57b07591d756d67'
                ]} /> */}
            {/* {items.map((bubble, index) => {

            }
            )} */}
        </View>
    )
}