import mongoose, { Document, Model, Query, Schema, Types } from "mongoose";
import Counter from "../model/Counter";
import User from "../model/User";
import { Server, Signal } from "../../../../shared/types";
import Mailbox from "../model/Mailbox";
import { th } from "date-fns/locale";

export interface IMail {
    e164 : string,
    deviceId: number,
    cipherMessage: string,
    cipherType: number,
    type: number,
    timestamp: string
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
    type: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: String,
        required: true
    }
})

export interface IMailbox {
    device: Types.ObjectId,
    box: Types.Array<IMail>
}

export interface MailboxModel extends Model<IMailbox> {
    getAll(device: Types.ObjectId): Promise<Array<Server.Mail>>
    clearAll(device: Types.ObjectId): Promise<boolean>
    add(device: Types.ObjectId,mail: Server.Mail): Promise<boolean> 
}

const MailboxSchema = new Schema<IMailbox, MailboxModel> ({
    device:{
        type: Schema.Types.ObjectId,
        ref: 'Device'
    },
    box: {
        type: [MailSchema],
        default: []
    },
})
MailboxSchema.index({
    device: 1,
}, {
    unique: true
})

MailboxSchema.static('getAll', async function getAll(device: Types.ObjectId): Promise<Array<Server.Mail>> {
    const mailBox = await Mailbox.findOne({
        device: device
    })
    if (mailBox === null) return null

    const mails: Array<Server.Mail> = []
    mailBox.box.forEach((iMail) => {
        mails.push({
            sender: {
                e164: iMail.e164,
                deviceId: iMail.deviceId
            },
            message: {
                data: {
                    cipher: iMail.cipherMessage,
                    type: iMail.cipherType
                },
                type: iMail.type,
                timestamp: iMail.timestamp
            }
        })
    })

    return mails
})

MailboxSchema.static('clearAll', async function clearAll(device: Types.ObjectId): Promise<boolean> {
    const mailBox = await Mailbox.findOneAndUpdate({
        device: device
    }, {
        box: []
    })
    if (mailBox === null) return false

    return true
})

MailboxSchema.static('add', async function add(device: Types.ObjectId, mail: Server.Mail): Promise<boolean>  {
    const mailBox = await Mailbox.findOne({
        device: device
    })
    if (mailBox === null) return false

    const iMail: IMail = {
        e164: mail.sender.e164,
        deviceId: mail.sender.deviceId,
        cipherMessage: mail.message.data.cipher,
        cipherType: mail.message.data.type,
        type: mail.message.type,
        timestamp: mail.message.timestamp
    }

    mailBox.box.push(iMail)
    const result = await mailBox.save()
    return result !== null
})

export default MailboxSchema