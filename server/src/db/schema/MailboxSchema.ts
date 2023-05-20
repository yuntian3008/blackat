import mongoose, { Document, Model, Query, Schema, Types } from "mongoose";
import Counter from "../model/Counter";
import User from "../model/User";
import { Server, Signal } from "../../../../shared/types";
import { th } from "date-fns/locale";
import Mail from "../model/Mail";

export interface IMail {
    e164: string,
    deviceId: number,
    cipherMessage: string,
    cipherType: number,
    fileInfoName?: string,
    fileInfoType?: string,
    fileInfoSize?: number,
    type: number,
    timestamp: string,
    device: Types.ObjectId,
}

const MailSchema = new Schema<IMail>({
    e164: {
        type: String,
        required: true
    },
    deviceId: {
        type: Number,
        required: true
    },
    cipherMessage: {
        type: String,
        required: true
    },
    cipherType: {
        type: Number,
        required: true,
    },
    fileInfoName: {
        type: String,
        required: false,
    },
    fileInfoType: {
        type: String,
        required: false,
    },
    fileInfoSize: {
        type: Number,
        required: false,
    },
    type: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: String,
        required: true
    },
    device: {
        type: Schema.Types.ObjectId,
        ref: 'Device'
    },
})

export interface MailModel extends Model<IMail> {
    rm(id: Types.ObjectId): Promise<void>
    getAll(device: Types.ObjectId): Promise<Array<Server.Mail>>
    clearAll(device: Types.ObjectId): Promise<void>
    add(device: Types.ObjectId,mail: Server.MessagePackage): Promise<string> 
}

// export interface IMailbox {
//     device: Types.ObjectId,
//     box: Types.Array<IMail>
// }

// export interface MailboxModel extends Model<IMailbox> {
//     getAll(device: Types.ObjectId): Promise<Array<Server.Mail>>
//     clearAll(device: Types.ObjectId): Promise<boolean>
//     add(device: Types.ObjectId,mail: Server.Mail): Promise<boolean> 
// }

// const MailboxSchema = new Schema<IMailbox, MailboxModel> ({
//     device:{
//         type: Schema.Types.ObjectId,
//         ref: 'Device'
//     },
//     box: {
//         type: [MailSchema],
//         default: []
//     },
// })
// MailboxSchema.index({
//     device: 1,
// }, {
//     unique: true
// })

MailSchema.static('getAll', async function getAll(device: Types.ObjectId): Promise<Array<Server.Mail>> {
    const result = await Mail.find({
        device: device
    })
    // if (mailBox === null) return null

    const mails: Array<Server.Mail> = []
    result.forEach((iMail) => {
        mails.push({
            id: iMail._id.toHexString(),
            sender: {
                e164: iMail.e164,
                deviceId: iMail.deviceId
            },
            message: {
                data: {
                    cipher: iMail.cipherMessage,
                    type: iMail.cipherType
                },
                fileInfo: (!iMail.fileInfoName && !iMail.fileInfoType && !iMail.fileInfoSize) ? undefined : {
                    name: iMail.fileInfoName,
                    type: iMail.fileInfoType,
                    size: iMail.fileInfoSize,
                },
                type: iMail.type,
                timestamp: iMail.timestamp
            }
        })
    })

    return mails
})

MailSchema.static('clearAll', async function clearAll(device: Types.ObjectId): Promise<void> {
    const mails = await Mail.deleteMany({
        device: device
    })
})

MailSchema.static('rm', async function rm(id: Types.ObjectId): Promise<void> {
    const mails = await Mail.findByIdAndRemove(id)
})

MailSchema.static('add', async function add(device: Types.ObjectId, mail: Server.MessagePackage): Promise<string> {
    // const mailBox = await Mailbox.findOne({
    //     device: device
    // })
    // if (mailBox === null) return false

    const iMail: IMail = {
        e164: mail.address.e164,
        deviceId: mail.address.deviceId,
        cipherMessage: mail.message.data.cipher,
        cipherType: mail.message.data.type,
        fileInfoName: mail.message.fileInfo?.name,
        fileInfoType: mail.message.fileInfo?.type,
        fileInfoSize: mail.message.fileInfo?.size,
        type: mail.message.type,
        timestamp: mail.message.timestamp,
        device: device
    }

    const result = await Mail.create(iMail)

    // mailBox.box.push(iMail)
    // const result = await mailBox.save()
    // return result !== null
    return result._id.toString()
})


export default MailSchema