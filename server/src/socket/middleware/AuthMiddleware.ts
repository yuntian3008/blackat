import { Middleware, ServerSocket } from "socket";
import { Socket } from "socket.io";
import { verifyIdToken } from "../../firebase/auth";
import { DecodedIdToken } from "firebase-admin/auth";
import User from "../../db/model/User";
import Key from "../../db/model/Key";
import Device from "../../db/model/Device";

const handle = async (socket: ServerSocket): Promise<void> => {
    const idToken = socket.handshake.auth.token
    const registrationId = socket.handshake.auth.registrationId
    const fcmToken = socket.handshake.auth.fcmToken
    if (!idToken || !registrationId || !fcmToken) {
        throw new Error("not valid login")
    }
    try {
        
        const decodedIdToken = await verifyIdToken(idToken)
        const phoneNumber = decodedIdToken.phone_number
        socket.data.phoneNumber = phoneNumber
        socket.data.device = registrationId

        const loginResult = await User.login(phoneNumber, registrationId, fcmToken)
        if (loginResult.success == true) {
            socket.data.logged = loginResult.info
            const device_id = await Device.getId(loginResult.info.e164, loginResult.info.deviceId)
            socket.data.deviceObjectId = device_id
            
            socket.data.bundleRequirement = await Key.check(device_id)
            
            
            return
        }
        else throw Error("failed to login")

    } catch(err) {
        throw err
    }
    
}

const AuthMiddleware: Middleware = (socket, next) => {
    handle(socket).then(() => {
        next()
    }).catch((e: Error) => {
        next(e)
    })
}


export default AuthMiddleware