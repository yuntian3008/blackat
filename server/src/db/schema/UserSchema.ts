import { Model, Schema, Types } from "mongoose";
import Device from "../model/Device";
import Counter from "../model/Counter";

export interface IUser {
    phoneNumber: string,
    devices: Types.Array<Types.ObjectId>
}

export interface UserModel extends Model<IUser> {
    login(phoneNumber: string, deviceUniqueId: string): Promise<LoginResult>;
}

export type LoginResult = {
    isNewUser: boolean,
    isNewDevice: boolean,
}

const UserSchema = new Schema<IUser, UserModel>({
    phoneNumber: {
        type: String, required: true, unique: true,
    },
    devices: [{
        type: Schema.Types.ObjectId, ref: 'Device'
    }]
})

UserSchema.static('login', function login(phoneNumber: string, deviceUniqueId: string) {
    let model = this;
    return new Promise<LoginResult>(function (resolve, reject) {
        let result: LoginResult = {
            isNewDevice: true,
            isNewUser: true,
        }
        model.findOneAndUpdate(
            { phoneNumber: phoneNumber },
            { phoneNumber: phoneNumber }, {
            upsert: true,
            new: true,
        }).then((user) => {
            console.log(user.isNew)
            const device = new Device({
                user: user._id,
                deviceUniqueId: deviceUniqueId
            })

            device.save()
            .then(() => {
                result.isNewDevice = true
            })
            .catch(() => {
                Counter.des(user._id,'device')
                result.isNewDevice = false
            })
            .finally(() => {
                resolve(result)
            })
        }).catch((err) => {
            reject(err)
        })
    })

})


export default UserSchema