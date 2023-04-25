import User from "../db/model/User"
import Key from "../db/model/Key"
import { PreKeyBundle } from "../../../shared/types"
import { te } from "date-fns/locale"

export const testMode = false

export default async function test() {
    const user = await User.findOne({ phoneNumber: "+84372723361"})
    const deviceId = user.devices[0]
    // console.log(deviceId)
    const check = await Key.check(deviceId)

    
    const key = Key.findOne({ device: deviceId})

    // Key.initialize(deviceId,preKeyBundle)

    console.log(key)
}