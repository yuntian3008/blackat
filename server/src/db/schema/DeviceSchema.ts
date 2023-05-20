import mongoose, { Document, Model, Query, Schema, Types } from "mongoose";
import Counter from "../model/Counter";
import User from "../model/User";
import { Type } from "typescript";

export interface IDevice {
    deviceId: number,
    registrationId: number,
    user: Types.ObjectId,
    key: Types.ObjectId,
    // mailbox: Types.ObjectId,
    fcmToken?: string,
}

export interface DeviceModel extends Model<IDevice> {
    getId(phoneNumber: string, deviceId: number): Promise<Types.ObjectId>
}

const DeviceSchema = new Schema<IDevice, DeviceModel>({
    deviceId: {
        type: Number, default: null,
    },
    registrationId: {
        type: Number, required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    key: {
        type: Schema.Types.ObjectId,
        ref: 'Key'
    },
    // mailbox: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Mailbox'
    // },
    fcmToken: {
        type: String,
        default: null,
    }
})
DeviceSchema.index({
    registrationId: 1,
    user: 1,
}, {
    unique: true
})
DeviceSchema.pre('save', function (next) {
    if (this.isNew) {
        let device = this
        Counter.inc(device.user, 'device').then((deviceId) => {
            console.log("truoc khi save", deviceId)
            device.deviceId = deviceId
            next()
        }).catch(err => next(err))
    } else {
        next()
    }

})

DeviceSchema.static('getId', async function getId(phoneNumber: string, deviceId: number): Promise<Types.ObjectId> {
    const user = await User.findOne({
        phoneNumber: phoneNumber
    })
    if (user === null) return null
    const device = await this.findOne({
        deviceId: deviceId,
        user: user._id
    })

    return device?._id
})

export default DeviceSchema