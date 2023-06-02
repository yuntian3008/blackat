import { Socket } from "socket.io";
import Device from "../db/model/Device";
import { ServerSocket } from "socket";
import { Server, SessionInfo, Signal, SocketEvent } from "../../../shared/types";
import User from "../db/model/User";
import Key from "../db/model/Key";
import { clients } from "../server";
import { sendNotificationMessage } from "../firebase/messaging";
import Mail from "../db/model/Mail";
import { Types } from "mongoose";

const sendNotification = async (sender: Signal.Types.SignalProtocolAddress, message: Server.MessagePackage) => {
    const deviceId = await Device.getId(message.address.e164, message.address.deviceId)
    const device = await Device.findById(deviceId)

    const receiverPackage: Server.MessagePackage = {
        address: sender,
        message: message.message
    }

    if (device.fcmToken) {
        sendNotificationMessage([device.fcmToken], {
            message: JSON.stringify(receiverPackage),
            // android: {
            //     channelId: 'messages',
            //     sound: 'inComing',
            //     vibrationPattern: [300,300,300,300],
            //     actions: [
            //         {
            //             title: 'Trả lời'
            //         }
            //     ]
            // }

        })
    }

}

// const offlineHandle = (sender: Signal.Types.SignalProtocolAddress, address: Signal.Types.SignalProtocolAddress, message: Server.Message): Promise<void> =>
//     new Promise((resolve, reject) => {
//         Device.getId(address.e164, address.deviceId)
//             .then((device) => {
//                 Mailbox.add(device, {
//                     sender: sender,
//                     message: message
//                 }).then((mailbox) => {
//                     if (mailbox) {
//                         sendNotification(sender, {
//                             address, message
//                         })
//                         resolve()
//                     }
//                     else reject(new Error("Mailbox failed to create a mail")) 
//                 }).catch((err) => {
//                     console.log(err)
//                     reject(err)
//                 })
//             }).catch((err) => {
//                 console.log(err)
//                 reject(err)
//             })
//     })

const saveMessage = (sender: Signal.Types.SignalProtocolAddress, address: Signal.Types.SignalProtocolAddress, message: Server.Message): Promise<string> =>
    new Promise((resolve, reject) => {
        Device.getId(address.e164, address.deviceId)
            .then((device) => {
                Mail.add(device, {
                    address: sender,
                    message: message
                }).then((mailId) => {
                    resolve(mailId)
                }).catch((err) => {
                    console.log(err)
                    reject(err)
                })
            }).catch((err) => {
                console.log(err)
                reject(err)
            })
    })

// const onlineHandle = (sender: Signal.Types.SignalProtocolAddress, address: Signal.Types.SignalProtocolAddress, message: Server.Message): Promise<SocketEvent.OutGoingMessageResult> =>
//     new Promise((resolve, reject) => {
//         clients.get(JSON.stringify(address)).timeout(20000).emit('inComingMessage', sender, message, (err, inComingMessageResult) => {
//             if (err) {
//                 offlineHandle(sender, address, message).then(() => {
//                     resolve({
//                         sentAt: SocketEvent.SendAt.MAILBOX
//                     })
//                 }).catch((e) => {
//                     reject(e)
//                 })
//             } else {
//                 if(inComingMessageResult.isProcessed) {
//                     resolve({
//                         sentAt: SocketEvent.SendAt.DEVICE
//                     })
//                 }
//                 reject(new Error("Receiver failed to process"))

//             }

//         })
//     })

export default function Connection(socket: ServerSocket) {

    socket.emit('logged', socket.data.logged)
    socket.emit('requireBundle', socket.data.bundleRequirement)
    console.log(socket.data.logged.e164 + " bắt đầu quá trình check mail")

    socket.on('online', () => {
        clients.set(JSON.stringify({
            e164: socket.data.logged.e164,
            deviceId: socket.data.logged.deviceId
        }), socket)
        console.log(socket.data.logged.e164 + " vào trạng thái online")
        console.log(clients.keys())
    })


    const onRemoveAccount = async () => {
        try {
            const deviceId = await Device.getId(socket.data.logged.e164, socket.data.logged.deviceId)
            const keyRemoved = await Key.findOneAndRemove({ device: deviceId })
            const mailRemoved = await Mail.findOneAndRemove({ device: deviceId })
            const deviceRemoved = await Device.findByIdAndRemove(deviceId)

            const user = await User.findOne({ phoneNumber: socket.data.logged.e164 })
            if (user) {
                const userWithDevice = await user.populate({
                    path: 'devices',
                    select: {
                        deviceId: 1
                    }
                });
                const removedDeviceIndex = userWithDevice.devices.indexOf(deviceId)
                if (removedDeviceIndex > -1) {
                    userWithDevice.devices.splice(removedDeviceIndex,1)
                    await userWithDevice.save()
                }
                if (userWithDevice.devices.length == 0)
                    await User.findByIdAndRemove(user._id) 
            }


        } catch (e) {
            throw e
        }
    }

    socket.on('removeDevice', (callback) => {
        onRemoveAccount().catch((e) => {
            console.log("[REMOVE DEVICE]")
            console.log(e)
        }).finally(() => {
            callback()
            socket.disconnect()
        })
    })

    socket.on('checkMailbox', (callback) => {
        Mail.getAll(socket.data.deviceObjectId).then((v) => {
            callback(v)
        }).catch((e) => {
            console.log("[CHECK MAIL]")
            console.log(e)
        })
    })

    socket.on('deleteMail', (mailId) => {
        Mail.rm(new Types.ObjectId(mailId))
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

    const outGoingMessageV2 = async (sender: Signal.Types.SignalProtocolAddress, messages: Array<Server.MessagePackage>) => {
        console.log(`Tin nhắn đi (v2)[length:${messages.length}]`)
        try {
            for (let pack of messages) {
                console.log(`[${sender.e164},${sender.deviceId}] => [${pack.address.e164},${pack.address.deviceId}]`)
                await saveMessage(sender, pack.address, pack.message)
                if (clients.has(JSON.stringify(pack.address))) {
                    console.log(`[ONLINE][TYPE:${pack.message.type}][CIPHER:${pack.message.data.type}]`)
                    // const result = await onlineHandle(sender,pack.address,pack.message)
                    clients.get(JSON.stringify(pack.address)).emit('newMessage')
                } else {
                    console.log(`[OFFLINE][TYPE:${pack.message.type}][CIPHER:${pack.message.data.type}]`)
                    sendNotification(sender, pack)
                }

            }
            return true
        }
        catch (err) {
            console.log(`That bai`)
            console.log(err)
            return false
        }

    }



    socket.on('outGoingMessage', (sender, messages, callback) => {
        // console.log(sender)
        // console.log(messages.size)
        // const map = new Map<Signal.Types.SignalProtocolAddress, Server.Message>(JSON.parse(messages))
        outGoingMessageV2(sender, messages).then((success) => {
            callback(success)
        })
    })

    // socket.on('outGoingMessage', (sender, address, message, callback) => {
    //     // console.log([...clients.entries()])
    //     console.log("Có tin nhắn loại " + message.type)
    //     if (clients.has(JSON.stringify(address))) {
    //         console.log('tin nhắn từ ' + sender.e164 + ' gửi đến ' + address.e164 + ' đang trực tuyến [CIPHERTYPE: ' + message.data.type + ']')
    //         onlineHandle(sender,address,message).then((v) => {
    //             callback(v)
    //         }).catch(() => {
    //             callback({
    //                 sentAt: SocketEvent.SendAt.FAILED
    //             })
    //         })
    //     } else {
    //         offlineHandle(sender, address, message).then(() => {
    //             callback({
    //                 sentAt: SocketEvent.SendAt.MAILBOX
    //             })
    //         }).catch(() => {
    //             callback({
    //                 sentAt: SocketEvent.SendAt.FAILED
    //             })
    //         })
    //     }
    // })

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