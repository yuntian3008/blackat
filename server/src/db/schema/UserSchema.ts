import { Model, ObjectId, Schema, Types } from "mongoose";
import Device from "../model/Device";
import Counter from "../model/Counter";
import User from "../model/User";
import { IDevice } from "./DeviceSchema";
import { LoggedInfo, Signal } from "../../../../shared/types";
import Key from "../model/Key";

export interface IUser {
    phoneNumber: string,
    devices: Types.Array<Types.ObjectId>
    // activeDevice?: number 
}

export interface UserModel extends Model<IUser> {
    // updateState(info: LoggedInfo, connected: boolean): Promise<boolean>
    login(phoneNumber: string, registrationId: number, fcmToken: string): Promise<LoginResult>;
    findKeyWithoutDevice(phoneNumber: string): Promise<Types.ObjectId>
    // readyToStart(phoneNumber: string): Promise<boolean>
    getAddresses(phoneNumber: string): Promise<Array<Signal.Types.SignalProtocolAddress>>
    getTokens(phoneNumber: string): Promise<Array<string>>
}

export type LoginResult = {
    success: boolean
    info?: LoggedInfo
}

const UserSchema = new Schema<IUser, UserModel>({
    phoneNumber: {
        type: String, required: true, unique: true,
    },
    devices: [{
        type: Schema.Types.ObjectId, ref: 'Device'
    }],
    // activeDevice: {
    //     type: Number,
    //     default: null
    // }
})

UserSchema.static('login',async function login(e164: string, registrationId: number, fcmToken: string): Promise<LoginResult> {

    let result: LoginResult = {
        success: false,
        info: {
            isNewUser: false,
            isNewDevice: false,
            deviceId: null,
            e164: null
        }
    }

    try {
        var user = await this.findOne({ phoneNumber: e164 })
        if (user === null) {
            const newUser = new User({
                phoneNumber: e164
            })
            user = await newUser.save()
            result.info.isNewUser = true
        }
        const userWithDevice = await user.populate({
            path: 'devices',
            match: {
                registrationId: registrationId
            },
            select: {
                deviceId: 1
            }
        })
        const devices = userWithDevice.devices
        let device
        if (devices.length == 0) {

            const newDevice = await new Device({
                user: user._id,
                registrationId: registrationId,
                fcmToken: fcmToken
            }).save()
            
            const newKey = await new Key({
                device: newDevice._id
            }).save()

            // const newMailbox = await new Mailbox({
            //     box: [],
            //     device: newDevice._id
            // }).save()
            

            userWithDevice.devices.push(newDevice)
            await userWithDevice.save()

            newDevice.key = newKey._id
            // newDevice.mailbox = newMailbox._id
            await newDevice.save()

            result.info.isNewDevice = true
            device = newDevice
        } else {
            device = await Device.findById(devices[0])
        }
        result.success = true
        result.info.e164 = e164
        result.info.deviceId = device.deviceId
        
        // const noDeviceIsConnecting = this.updateState(result.info, true)
        // if (!noDeviceIsConnecting) return {
        //     success: false,
        // }
            
     
    } catch (e) {
        result.success = false,
        result.info = undefined
        console.log('[login]')
        console.log(e)
    }

    return result
    

})

// UserSchema.static('updateState',async function updateState(info: LoggedInfo, connected: boolean): Promise<boolean> {
//     const user = await User.findOne({
//         phoneNumber: info.e164
//     })
//     if (connected && user.activeDevice !== null) {
//         return user.activeDevice === info.deviceId
//     }
//     user.activeDevice = connected ? info.deviceId : null,
//     await user.save()
//     return true
// })

// UserSchema.static('readyToStart', async function readyToStart(phoneNumber: string): Promise<boolean> {
//     const user = await this.findOne({phoneNumber: phoneNumber})
//     if(user === null) return false

//     if(user.activeDevice === null) return false

//     const device = await Device.findOne({
//         user: user._id,
//         deviceId: user.activeDevice
//     })

//     // if(device === null) return false

//     const checkKey = await Key.check(device._id)

//     return !checkKey.needIdentityKey && !checkKey.needPreKeys && !checkKey.needSignedPreKey
// })

UserSchema.static('getAddresses',async function getAddresses(phoneNumber: string): Promise<Array<Signal.Types.SignalProtocolAddress>> {
    const result: Array<Signal.Types.SignalProtocolAddress> = []
    const user = await this.findOne({phoneNumber: phoneNumber}).populate('devices')
    if(user === null) return result

    for (let index = 0; index < user.devices.length; index++) {
        const deviceId = user.devices[index];
        const device = await Device.findById(deviceId)
        result.push({
            e164: phoneNumber,
            deviceId: device.deviceId
        })
    }
    return result
})

UserSchema.static('getTokens',async function getTokens(phoneNumber: string): Promise<Array<string>> {
    const result: Array<string> = []
    const user = await this.findOne({phoneNumber: phoneNumber}).populate('devices')
    if(user === null) return result

    for (let index = 0; index < user.devices.length; index++) {
        const deviceId = user.devices[index];
        const device = await Device.findById(deviceId)
        if (device.fcmToken)
            result.push(device.fcmToken)
    }
    return result
})

export default UserSchema