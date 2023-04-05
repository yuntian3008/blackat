import { Middleware } from "socket";
import { Socket } from "socket.io";
import { verifyIdToken } from "../../firebase/auth";
import { DecodedIdToken } from "firebase-admin/auth";
import User from "../../db/model/User";

const AuthMiddleware: Middleware = (socket, next) => {
    const idToken = socket.handshake.auth.token
    const deviceUniqueId = socket.handshake.auth.deviceUniqueId
    if (!idToken || !deviceUniqueId) {
        next(new Error("not valid login"))
        return;
    }
    verifyIdToken(idToken).then((decodedIdToken) => {
        const phoneNumber = decodedIdToken.phone_number
        socket.data.phoneNumber = phoneNumber
        socket.data.device = deviceUniqueId

        User.login(phoneNumber, deviceUniqueId)
            .then((value) => {
                console.log(value)
                next()
            })
            .catch(err => next(err))



    }).catch((err) => {
        console.log(err.code)
        next(new Error("error"))
    })
}


export default AuthMiddleware