import { add, formatISO } from "date-fns";
import { App, BundleRequirement, Server, Signal, SignalError, SocketEvent } from "../../shared/types";
import SignalModule from "../native/android/SignalModule";
import Log, { LogEnabled } from "./Log";
import socket from "./socket";
import AppModule from "../native/android/AppModule";
import { Alert, AppState, BackHandler, ToastAndroid } from "react-native";
import notifee from "@notifee/react-native"
import { pushInComingMessageNotification } from "./Fcm";
import { getProfileData, savePartnerProfile } from "./Setting";

// ===================== ONLINE HANDLE

const emitCheckMailBox = () => {
    return new Promise<Array<Server.Mail>>((resolve) => {
        socket.emit('checkMailbox', function (messages) {
            resolve(messages)
        })
    })
}


export const prepareMessaging = async () => {
    await mailboxHandler()
    const sendingMessage = await AppModule.getSendingMessages();
    const localAddress = await SignalModule.requireLocalAddress()
    for (let i = 0; i < sendingMessage.length; i++) {
        const v = sendingMessage[i];
        const send = await encryptAndSendMessage(localAddress, v.e164, v.message, v.fileInfo)
        if (send) AppModule.markAsSent(v.id)
        if (send == null) AppModule.markAsError(v.id)
    }
}

// ===================== SIGNAL PROTOCOL

const emitUploadIdentityKey = (identityKey: Signal.Types.IdentityKey) => {
    return new Promise<boolean>((resolve) => {
        socket.emit('uploadIdentityKey', identityKey, function (result) {
            resolve(result)
        })
    })
}



const emitUploadSignedPreKey = (signedPreKey: Signal.Types.SignedPreKey) => {
    return new Promise<boolean>((resolve) => {
        socket.emit('uploadSignedPreKey', signedPreKey, function (result) {
            resolve(result)
        })
    })
}

const emitUploadPreKeys = (preKeys: Array<Signal.Types.PreKey>) => {
    return new Promise<boolean>((resolve) => {
        socket.emit('uploadPreKeys', preKeys, function (result) {
            resolve(result)
        })
    })
}

const handleBundleRequire = async (requirement: BundleRequirement): Promise<boolean> => {
    try {
        let resultIdentityKey = true;
        let resultSignedPreKey = true;
        let resultPreKey = true;
        if (requirement.needIdentityKey) {
            const identityKey = await SignalModule.requireIdentityKey()
            resultIdentityKey = await emitUploadIdentityKey(identityKey)
        }
        if (requirement.needSignedPreKey) {
            const signedPreKey = await SignalModule.requireSignedPreKey()
            resultSignedPreKey = await emitUploadSignedPreKey(signedPreKey)
        }
        if (requirement.needPreKeys) {
            const preKeys = await SignalModule.requireOneTimePreKey()
            resultPreKey = await emitUploadPreKeys(preKeys)
        }
        return resultIdentityKey && resultPreKey && resultSignedPreKey
    } catch (e) {
        console.log(e)
        return false
    }

}

export const onBundleRequire = (requirement: BundleRequirement) => {
    if (requirement.needIdentityKey || requirement.needPreKeys || requirement.needSignedPreKey)
        //   ToastAndroid.show("Máy chủ thiếu một só khóa và yêu cầu cung cấp khóa chúng", ToastAndroid.SHORT)
        handleBundleRequire(requirement).then((v) => {

            if (!v) {
                // ToastAndroid.show("Cung cấp khóa cho máy chủ không thành công", ToastAndroid.SHORT)
                BackHandler.exitApp()
            }
            //   else ToastAndroid.show("Cung cấp khóa cho máy chủ thành công", ToastAndroid.SHORT)
        })
}

export const getPreKeyBundle = async (address: Signal.Types.SignalProtocolAddress): Promise<Signal.Types.PreKeyBundle> => new Promise((resolve, reject) => {
    socket.emit('getPreKeyBundle', address, (preKeyBundle) => {
        if (preKeyBundle === null) reject(new Error('not-found-key'))
        resolve(preKeyBundle)
    })
})

export const getAddresses = async (e164: string): Promise<Array<Signal.Types.SignalProtocolAddress>> => new Promise((resolve, reject) => {
    socket.emit('getAddresses', e164, (addresses) => {
        resolve(addresses)
    })
})

const syncSession = async function (e164: string) {
    const addresses = await getAddresses(e164)
    console.log(addresses)
    const missingSession = await SignalModule.missingSession(addresses)
    console.log(missingSession)

    for (let index = 0; index < missingSession.length; index++) {
        try {
            const missing = missingSession[index];
            const preKeyBundle = await getPreKeyBundle(missing)
            const perform = await SignalModule.performKeyBundle(e164, preKeyBundle)
            console.log("performKeyBundle[" + preKeyBundle.deviceId + "]: " + perform)
            if (!perform) console.log(preKeyBundle)
        } catch (e) {
            Log(e)
        }
    }


    return addresses
}

// ====================== MESSAGING

// export const outGoingMessage = async (
//     sender: Signal.Types.SignalProtocolAddress,
//     address: Signal.Types.SignalProtocolAddress,
//     message: Server.Message): Promise<SocketEvent.OutGoingMessageResult> => new Promise((resolve, reject) => {
//         if (socket.connected)
//             socket.emit('outGoingMessage', sender, address, message, (v) => {
//                 resolve(v)
//             })
//         else {
//             resolve({
//                 sentAt: SocketEvent.SendAt.FAILED
//             })
//         }

//     }



export const onNewMessage = () => {
    mailboxHandler()
}

export const outGoingMessage = async (
    sender: Signal.Types.SignalProtocolAddress, messages: Array<Server.MessagePackage>): Promise<boolean> => new Promise((resolve) => {
        if (socket.connected)
            socket.emit('outGoingMessage', sender, messages, (v) => {
                resolve(v)
            })
        else {
            resolve(false)
        }
    })

export const inComingMessage = async (sender: Signal.Types.SignalProtocolAddress, message: Server.Message) => {
    try {
        const messageData = await receiveAndDecryptMessage(sender, message)
        if (messageData !== null) {
            await saveMessageToLocal(sender.e164, messageData, App.MessageState.UNREAD)
            if (AppState.currentState.match(/inactive|background/)) {
                pushInComingMessageNotification(
                    sender.e164, {
                    ...messageData,
                    // Nếu là không phải dạng Text, bỏ bớt data (có thể là file kích thước lớn)
                    data: messageData.type !== App.MessageType.TEXT ? "" : messageData.data
                }
                )
            }
        }
    }
    catch (e) {
        SignalModule.getProfile().then((profile) => {
            console.log(`${profile.e164} lỗi tin nhắn đến:`)
            console.log(e)
        })

        throw e
    }

}

export const saveMessageToLocal = async (e164: string, message: App.Types.MessageData, state: string, fileInfo?: Server.FileInfo) => {
    try {
        if (fileInfo !== undefined)
            await AppModule.saveFileMessage(e164, message, state, fileInfo)
        else
            await AppModule.saveMessage(e164, message, state)
    }
    catch (e) { console.log(e) }
}

export const receiveAndDecryptMessage = async (sender: Signal.Types.SignalProtocolAddress, message: Server.Message): Promise<App.Types.MessageData | null> => {
    try {
        let plainText
        if (message.fileInfo !== undefined) {
            console.log("Nhan dc anh dang decrypt")
            plainText = await SignalModule.decryptFile(sender, message.data, message.fileInfo, false)
        }
        else
            plainText = await SignalModule.decrypt(sender, message.data, false)
        if (plainText === null) {
            Log("GHI FILE THẤT BẠI")
            // ToastAndroid.show('GHI FILE THẤT BẠI', ToastAndroid.SHORT)
            throw new Error("GHI FILE THAT BAI")
        }
        if (typeof plainText !== "string") {
            const error = (plainText as SignalError)
            Log(`TYPE ERROR (SENDER: ${sender.e164},${sender.deviceId}): ${error.code} | stack: ${error.stack}`)
            if (error.code == "duplicate") {
                return null;
            }
            if (error.code == "need-encrypt") {
                const localAddress = await SignalModule.requireLocalAddress()
                const profile = await getProfileData()
                const profileCipher = await SignalModule.encrypt(sender, profile)
                const profileMessage: Server.Message = {
                    data: profileCipher,
                    type: App.MessageType.PROFILE,
                    timestamp: formatISO(new Date()),
                }

                const result = await outGoingMessage(localAddress, [{
                    address: sender,
                    message: profileMessage
                }])
                if (message.fileInfo !== undefined) {
                    plainText = await SignalModule.decryptFile(sender, message.data, message.fileInfo, true)
                }
                else
                    plainText = await SignalModule.decrypt(sender, message.data, true)
                if (typeof plainText !== "string") throw new Error((plainText as SignalError).stack)
            }
        }
        if (message.type == App.MessageType.EMPTY) return null;
        if (message.type == App.MessageType.PROFILE) {
            console.log("PROFILE RECEIVED")
            const profile = await savePartnerProfile(sender.e164, plainText as string)
            console.log(profile)
            await AppModule.upsertPartnerProfile(sender, profile)

            return null
        }
        const decryptedMessage: App.Types.MessageData = {
            data: plainText as string,
            owner: App.MessageOwner.PARTNER,
            timestamp: message.timestamp,
            type: message.type,
            senderDevice: sender.deviceId,
        }
        return decryptedMessage
        // saveMessageToLocal(sender.e164,decryptedMessage)
    } catch (e) {
        Log("[receiveAndDecryptMessage]")
        Log(e)
        if (e instanceof Error)
            throw e
        else return null
    }
}

export const encryptAndSendMessage = async function (
    localAddress: Signal.Types.SignalProtocolAddress,
    e164: string, message: App.Types.MessageData, fileInfo?: Server.FileInfo): Promise<boolean | null> {
    // console.log("startSendMessageToServer")
    const addresses = await syncSession(e164)
    if (addresses.length == 0) return null
    let messages: Array<Server.MessagePackage> = []
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
        messages.push({
            address: address,
            message: cipherMessage
        })
    }
    const send = await outGoingMessage(localAddress, messages)
    return send

}

// const findErrorMails = async (messages: Array<Server.Mail>): Promise<Array<Server.Mail>> => {
//     var errorMessage: Array<Server.Mail> = []
//     console.log("Có " + messages.length + " mail cần check")
//     for (let message of messages) {
//         try {
//             console.log("Đang check " + message.sender.e164)
//             const msgData = await receiveAndDecryptMessage(message.sender, message.message)
//             if (msgData !== null) {
//                 saveMessageToLocal(message.sender.e164, msgData, App.MessageState.UNREAD)
//                 AppModule.ting(message.sender.e164)
//             }

//         } catch (e) {
//             errorMessage.push(message)
//         }
//     }
//     return errorMessage
// }

export const mailboxHandler = async (): Promise<void> => {
    const mails = await emitCheckMailBox()
    for (let mail of mails) {
        try {
            await inComingMessage(mail.sender, mail.message)
            socket.emit('deleteMail', mail.id)
        } catch (e) {
            if (LogEnabled) {
                ToastAndroid.show("Xử lí tin nhắn đến thất bại [BÁO NGAY!!]", ToastAndroid.SHORT);
                Log(`MAIL HANDLER ERROR (ID: ${mail.id}):`)
                Log(e)
            }

        }
    }
    return;

}