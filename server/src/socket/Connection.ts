import { Socket } from "socket.io";
import Device from "../db/model/Device";
import { ServerSocket } from "socket";
import { SessionInfo } from "../../../shared/types";

export default function Connection(socket: ServerSocket) {
    
    
    socket.on('getDeviceId', (callback) => {
        Device.findOne({
            deviceUniqueId: socket.data.device,
        }).then((doc) => {
            callback(doc.deviceId)
        }).catch(() => {
            callback(new Error("can't get deviceId"))
        })
    })

    console.log(socket.data.phoneNumber + ' is connected ' + ` (${socket.data.device})`)

    socket.on('logout', () => {
        console.log(socket.data.phoneNumber + ' is logout')
        socket.disconnect()
    })

    socket.on("disconnect", (reason) => {
        console.log(socket.data.phoneNumber + ' disconnected (' + reason + ')')
    });
}