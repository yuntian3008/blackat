import { Socket } from "socket.io";
import Device from "../db/model/Device";
import { ServerSocket } from "socket";
import { Server, SessionInfo, Signal, SocketEvent } from "../../../shared/types";
import User from "../db/model/User";
import Key from "../db/model/Key";
import { clients } from "../server";
import Mailbox from "../db/model/Mailbox";

const offlineHandle = (sender: Signal.Types.SignalProtocolAddress, address: Signal.Types.SignalProtocolAddress, message: Server.Message): Promise<void> =>
    new Promise((resolve, reject) => {
        Device.getId(address.e164, address.deviceId)
            .then((device) => {
                Mailbox.add(device._id, {
                    sender: sender,
                    message: message
                }).then((mailbox) => {
                    if (mailbox) resolve()
                }).catch((err) => {
                    console.log(err)
                    reject(err)
                })
            }).catch((err) => {
                console.log(err)
                reject(err)
            })
    })

const onlineHandle = (sender: Signal.Types.SignalProtocolAddress, address: Signal.Types.SignalProtocolAddress, message: Server.Message): Promise<SocketEvent.OutGoingMessageResult> =>
    new Promise((resolve, reject) => {
        clients.get(address.e164).timeout(20000).emit('inComingMessage', sender, message, (err, inComingMessageResult) => {
            if (err) {
                offlineHandle(sender, address, message).then(() => {
                    resolve({
                        sentAt: SocketEvent.SendAt.MAILBOX
                    })
                }).catch((e) => {
                    reject(e)
                })
            } else {
                if(inComingMessageResult.isProcessed) {
                    resolve({
                        sentAt: SocketEvent.SendAt.DEVICE
                    })
                }
                reject(new Error("Receiver failed to process"))
                
            }

        })
    })

export default function Connection(socket: ServerSocket) {

    socket.emit('logged', socket.data.logged)
    socket.emit('requireBundle', socket.data.bundleRequirement)
    console.log(socket.data.logged.e164 + " bắt đầu quá trình check mail")

    socket.on('online', () => {
        clients.set(socket.data.phoneNumber, socket)
        console.log(socket.data.logged.e164 + " vào trạng thái online")
    })

    socket.on('checkMailbox', (callback) => {
        Mailbox.getAll(socket.data.deviceObjectId).then((v) => {
            callback(v)
            if (v.length > 0) {
                Mailbox.clearAll(socket.data.deviceObjectId)
            }
        }).catch((e) => {
            console.log("[CHECK MAIL]")
            console.log(e)
        })
    })




    socket.on('uploadIdentityKey', (identityKey, callback) => {
        Key.setIdentityKey(socket.data.deviceObjectId, identityKey).then((v) => {
            callback(v)
        })
    })

    socket.on('uploadSignedPreKey', (signedPreKey, callback) => {
        Key.setSignedPreKey(socket.data.deviceObjectId, signedPreKey).then((v) => {
            callback(v)
        })
    })

    socket.on('uploadPreKeys', (preKeys, callback) => {
        Key.addPreKeys(socket.data.deviceObjectId, preKeys).then((v) => {
            callback(v)
        })
    })

    socket.on('isSomeOneThere', (e164, resolve) => {
        User.findOne({
            phoneNumber: e164
        }).then((v) => {
            resolve(v !== null)
        }).catch((e) => {
            console.log("[isSomeOneThere]")
            console.log(e)
        })
    })

    socket.on('getAddresses', (e164, callback) => {
        User.getAddresses(e164)
            .then((v) => {
                callback(v)
            }).catch((e) => {
                console.log("[getAddresses]")
                console.log(e)
                callback([])
            })
    })

    socket.on('getPreKeyBundle', (address, callback) => {
        Key.get(address)
            .then((preKeyBundle) => {
                callback(preKeyBundle)
            })
            .catch((e) => {
                callback(null)
                console.log("[getPreKeyBundle]")
                console.log(e)
            })
    })

    socket.on('getDeviceId', (callback) => {
        Device.findOne({
            deviceUniqueId: socket.data.device,
        }).then((doc) => {
            callback(doc.deviceId)
        }).catch(() => {
            callback(new Error("can't get deviceId"))
        })
    })

    const outGoingMessageV2 = async (sender: Signal.Types.SignalProtocolAddress, messages: Map<Signal.Types.SignalProtocolAddress, Server.Message>) => {
        console.log("Tin nhắn đi (v2)")
        try {
            for (let address of messages.keys()) {
                console.log(`[${sender.e164},${sender.deviceId}] => [${address.e164},${address.deviceId}]`)
                let message = messages.get(address)
                if (clients.has(address.e164)) {
                    console.log(`[ONLINE][TYPE:${message.type}][CIPHER:${message.data.type}]`)
                    // console.log('[]' + sender.e164 + ' gửi đến ' + address.e164 + ' đang trực tuyến [CIPHERTYPE: ' + message.data.type + ']')
                    const result = await onlineHandle(sender,address,message)
                } else {
                    console.log(`[OFFLINE][TYPE:${message.type}][CIPHER:${message.data.type}]`)
                    await offlineHandle(sender, address, message)
                }
            }
            return true
        }
        catch (err) {
            return false
        }
        
    }

    socket.on('outGoingMessageV2', (sender, messages, callback) => {
        outGoingMessageV2(sender,messages).then((success) => {
            callback(success)
        })
    })

    socket.on('outGoingMessage', (sender, address, message, callback) => {
        // console.log([...clients.entries()])
        console.log("Có tin nhắn loại " + message.type)
        if (clients.has(address.e164)) {
            console.log('tin nhắn từ ' + sender.e164 + ' gửi đến ' + address.e164 + ' đang trực tuyến [CIPHERTYPE: ' + message.data.type + ']')
            clients.get(address.e164).timeout(20000).emit('inComingMessage', sender, message, (err, inComingMessageResult) => {
                if (err) {
                    offlineHandle(sender, address, message, callback)
                } else {
                    callback({
                        sentAt: inComingMessageResult.isProcessed ? SocketEvent.SendAt.DEVICE : SocketEvent.SendAt.FAILED
                    })
                }

            })
        } else {
            offlineHandle(sender, address, message, callback)
        }
    })

    // socket.on('getBundle', (registrationId,deviceId,preKey,signedPreKey,identityKey) => {
    //     const preKeyBuffer = Buffer.from(preKey,'base64')
    //     const signedPreKeyBuffer = Buffer.from(signedPreKey,'base64')
    //     const identityKeyBuffer = Buffer.from(identityKey,'base64')


    //     const preKeyRecord = Signal.PreKeyRecord.deserialize(preKeyBuffer)
    //     const signedPreKeyRecord = Signal.SignedPreKeyRecord.deserialize(signedPreKeyBuffer)
    //     const identityKeyRecord = Signal.PublicKey.deserialize(identityKeyBuffer)

    //     const bundle = Signal.PreKeyBundle.new(
    //         registrationId,
    //         deviceId,
    //         preKeyRecord.id(),
    //         preKeyRecord.publicKey(),
    //         signedPreKeyRecord.id(),
    //         signedPreKeyRecord.publicKey(),
    //         signedPreKeyRecord.signature(),
    //         identityKeyRecord
    //     )


    // })

    console.log(socket.data.phoneNumber + ' is connected ' + ` (${socket.data.device})`)

    socket.on('logout', () => {
        console.log(socket.data.phoneNumber + ' is logout')
        // User.updateState(socket.data.logged, false)
        socket.disconnect()
    })

}