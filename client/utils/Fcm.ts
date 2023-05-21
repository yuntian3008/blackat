import { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import notifee, { AndroidStyle, DisplayedNotification, EventType, Notification } from '@notifee/react-native';
import { App, Server } from "../../shared/types";
import { encryptAndSendMessage, receiveAndDecryptMessage, saveMessageToLocal } from "./Messaging";
import { format, formatDistanceStrict, formatISO, isToday, parseISO } from "date-fns";
import { da, vi } from "date-fns/locale";
import socket from "./socket";
import SignalModule from "../native/android/SignalModule";

const displaySentAt = (sentAt: string): string => {
    const date = parseISO(sentAt)
    const dateFormat = isToday(date) ? "HH:mm" : "dd/MM/yyyy"
    return format(date, dateFormat, { locale: vi })
}

export const updateChat = async (notification: Notification, input: string) => {
    const e164 = notification.data!.e164 as string
    const conversation: Array<string> = JSON.parse(notification.data!.conversation as string)
    conversation.push(`<b>Bạn:</b> ${input}`)

    const localAddress = await SignalModule.requireLocalAddress()

    socket.connect()
    let messageState = App.MessageState.SENDING
    const messageData: App.Types.MessageData = {
        data: input,
        owner: App.MessageOwner.SELF,
        timestamp: formatISO(new Date()),
        type: App.MessageType.TEXT
    }
    const result = await encryptAndSendMessage(localAddress, e164, messageData )
    if (result) {
        messageState = App.MessageState.SENT
        notifee.displayNotification({
            id: notification.id,
            title: e164,
            data: {
                e164: e164,
                conversation: JSON.stringify(conversation)
            },
            android: {
                channelId: 'inComingMessage',
                style: {
                    type: AndroidStyle.INBOX,
                    lines: conversation,
                    summary: "Đã trả lời",
                },
            }
            // body: plainText.type == App.MessageType.TEXT ?
            //     `<b>${data.address.e164}:</b> ${plainText.data}` : undefined
        })
    }
    await saveMessageToLocal(e164, messageData, messageState)
}

export const onMessageReceived = async (message: FirebaseMessagingTypes.RemoteMessage) => {
    // notifee.createChannelGroup({
    //     id: 'conversation',
    //     name: "Cuộc trò chuyện",
    //     description: "Thông báo cuộc trò chuyện",
    // })
    if (socket.connected) return

    notifee.createChannel({
        id: 'inComingMessage',
        name: 'Tin nhắn đến',
        // groupId: 'conversation',
        lights: true,
        vibration: true,
        vibrationPattern: [300, 300, 300, 300],
        sound: 'incoming',
        badge: true,
    })

    if (message.data) {
        let data: Server.MessagePackage = JSON.parse(message.data.message)

        let decryptedData: App.Types.MessageData
        if (data.message.type === App.MessageType.TEXT) {
            try {
                const decrypted = await receiveAndDecryptMessage(data.address, data.message)
                if (decrypted === null) return;
                saveMessageToLocal(data.address.e164, decrypted!, App.MessageState.UNREAD)
                decryptedData = decrypted
            } catch (e) {
                console.log('Error -> New text message notification')
                console.log(e)
                return
            }
        }
        else {
            decryptedData = {
                data: "",
                owner: App.MessageOwner.PARTNER,
                timestamp: data.message.timestamp,
                type: data.message.type
            }
        }
        


        pushInComingMessageNotification(data.address.e164,decryptedData)


    }

}

export const pushInComingMessageNotification = async (name: string, data: App.Types.MessageData) => {
    // DEFINE ID BY E164
    const notificationId = name.replace('+', '').slice(2) 

    const displayed = await notifee.getDisplayedNotifications()
    const old = displayed.find((d => d.id === notificationId))


    let messageDisplay = "đã gửi 1 tin nhắn";
    // if (decrypted.type === App.MessageType.TEXT) messageDisplay = decrypted.data
    if (data.type === App.MessageType.TEXT) {
        messageDisplay = data.data
    }

    if (data.type === App.MessageType.IMAGE) messageDisplay = "đã gửi 1 ảnh"

    if (data.type === App.MessageType.STICKER) messageDisplay = "đã gửi 1 nhãn dán"

    const conversation: Array<string> = [
        `${messageDisplay}`
    ]
    if (old) {
        const oldConversation: Array<string> = JSON.parse(old.notification.data!.conversation as string)
        conversation.unshift(...oldConversation)
    }


    notifee.displayNotification({
        id: notificationId,
        title: name,
        subtitle: 'Blackat',
        body: messageDisplay,
        data: {
            link: `blackat://chatzone/${name}`,
            e164: name,
            conversation: JSON.stringify(conversation)
        },
        android: {
            showTimestamp:true,
            channelId: 'inComingMessage',
            vibrationPattern: [300, 300, 300, 300],
            sound: 'incoming',
            style: {
                type: AndroidStyle.INBOX,
                lines: conversation,
                summary: displaySentAt(data.timestamp),
            },
            pressAction: {
                // id: 
                id: 'default'
            },
            actions: [
                {
                    title: 'Trả lời',
                    pressAction: {
                        id: 'reply',
                    },
                    input: true,
                }
            ]
        }
    })
}