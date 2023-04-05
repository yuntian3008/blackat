import { Socket, io } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from '../../shared/types/socket'

const socket: Socket<ServerToClientEvents,ClientToServerEvents> = io('http://192.168.1.69:3000', {
    autoConnect: false,
})

export default socket