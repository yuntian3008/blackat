import mongoose, { Document, Model, Query, Schema, Types } from "mongoose";
import Counter from "../model/Counter";

export interface IDevice {
    deviceId : number,
    deviceUniqueId: string,
    user: Types.ObjectId,
}

export interface DeviceModel extends Model<IDevice> {
}

const DeviceSchema = new Schema<IDevice, DeviceModel> ({
    deviceId: {
        type: Number, default: null,
    },
    deviceUniqueId: {
        type: String, required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})
DeviceSchema.index({
    deviceUniqueId: 1,
    user: 1,
}, {
    unique: true
})
DeviceSchema.pre('save', function(next) {
    let device = this
    Counter.inc(device.user,'device').then((deviceId) => {
        device.deviceId = deviceId
        next()
    }).catch(err => next(err))
})
export default DeviceSchema