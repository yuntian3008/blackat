import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData
} from "../../../shared/types/socket";


export type ServerSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>

export type Middleware = (socket: ServerSocket, next: (err?: ExtendedError) => void) => void