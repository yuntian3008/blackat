import mongoose, { Document, Model, ObjectId, Query, Schema, Types } from "mongoose";
import { BundleRequirement, KeyBundle, PreKey, PreKeyBundle, Signal } from "../../../../shared/types";
import Key from "../model/Key";
import Device from "../model/Device";
import User from "../model/User";

export interface IPreKey {
    keyId: number,
    publicKey: string,
}

export interface IKey {
    device: Types.ObjectId,
    identityKey?: string,
    signedPreKeyId?: number,
    signedPreKey?: string,
    signedPreKeySignature?: string,
    preKey?: Types.Array<IPreKey>
}

export interface KeyModel extends Model<IKey> {
    check(device: Types.ObjectId): Promise<BundleRequirement>,
    setSignedPreKey(device: Types.ObjectId, signedPreKey: Signal.Types.SignedPreKey): Promise<boolean>
    setIdentityKey(device: Types.ObjectId, identityKey: Signal.Types.IdentityKey): Promise<boolean>
    addPreKeys(device: Types.ObjectId, preKeys: Array<Signal.Types.PreKey>): Promise<boolean>
    get(address: Signal.Types.SignalProtocolAddress): Promise<Signal.Types.PreKeyBundle>
}

const PreKeySchema = new Schema<IPreKey>({
    keyId: {
        type: Number,
    },
    publicKey: String,
})

// PreKeySchema.index({
//     keyId: 1
// }, {
//     unique: true
// })

const KeySchema = new Schema<IKey, KeyModel>({
    device: {
        type: Schema.Types.ObjectId,
        ref: 'Device',
    },
    identityKey: {
        type: String,
        default: null
    },
    signedPreKeyId: {
        type: Number,
        default: null
    },
    signedPreKey: {
        type: String,
        default: null
    },
    signedPreKeySignature: {
        type: String,
        default: null
    },
    preKey: {
        type: [PreKeySchema],
        default: []
    }
}, {
    timestamps: true
})
KeySchema.index({
    device: 1,
}, {
    unique: true
})
// DeviceSchema.pre('save', function(next) {
//     let device = this
//     Counter.inc(device.user,'device').then((deviceId) => {
//         device.deviceId = deviceId
//         next()
//     }).catch(err => next(err))
// })

KeySchema.static('check', async function (device: Types.ObjectId): Promise<BundleRequirement> {
    const key = await this.findOne({
        device: device
    })

    const keyRequirement: BundleRequirement = {
        needIdentityKey: true,
        needSignedPreKey: true,
        needPreKeys: true,
    }

    if (key === null) {
        const newKey = await new Key({
            device: device,
        }).save()
        await Device.findByIdAndUpdate(device, {
            key: newKey._id
        })
        return keyRequirement
    }


    if (key.identityKey !== null) keyRequirement.needIdentityKey = false

    if (key.signedPreKey !== null && key.signedPreKeyId !== null && key.signedPreKeySignature !== null) keyRequirement.needSignedPreKey = false

    if (key.preKey !== null && key.preKey.length > 50) keyRequirement.needPreKeys = false
    return keyRequirement
})

KeySchema.static('setSignedPreKey', async function setSignedPreKey(device: Types.ObjectId, signedPreKey: Signal.Types.SignedPreKey): Promise<boolean> {

    const d = await this.findOneAndUpdate({ device: device }, {
        signedPreKey: signedPreKey.key,
        signedPreKeyId: signedPreKey.id,
        signedPreKeySignature: signedPreKey.signature
    })
    if (d === null) return false
    return true
})


KeySchema.static('setIdentityKey', async function setSignedPreKey(device: Types.ObjectId, identityKey: Signal.Types.IdentityKey): Promise<boolean> {

    const d = await this.findOneAndUpdate({ device: device }, {
        identityKey: identityKey
    })
    if (d === null) return false
    return true
})

KeySchema.static('addPreKeys', async function setSignedPreKey(device: Types.ObjectId, prekeys: Array<Signal.Types.PreKey>): Promise<boolean> {

    const d = await this.findOne({ device: device })
    if (d === null) return false

    prekeys.forEach((prekey) => {
        const iPreKey: IPreKey = {
            keyId: prekey.id,
            publicKey: prekey.key
        }
        d.preKey.push(iPreKey)
    })
    await d.save()
    return true
})

KeySchema.static('get', async function (address: Signal.Types.SignalProtocolAddress): Promise<Signal.Types.PreKeyBundle> {
    const user = await User.findOne({ phoneNumber: address.e164 })
    if (user === null) throw new Error("not-found-user")
    const result: Array<Signal.Types.PreKeyBundle> = []

    const device = await Device.findOne({
        user: user._id,
        deviceId: address.deviceId
    })
    if (device === null || device.key === null) throw new Error("not-found-device")

    const key = await Key.findById(device.key)
    const preKey = key.preKey.shift()
    await key.save()

    return {
        deviceId: device.deviceId,
        registrationId: device.registrationId,
        identityKey: key.identityKey,
        signedPreKey: {
            id: key.signedPreKeyId,
            key: key.signedPreKey,
            signature: key.signedPreKeySignature
        },
        preKey: {
            id: preKey.keyId,
            key: preKey.publicKey
        }
    }

    

})

export default KeySchema