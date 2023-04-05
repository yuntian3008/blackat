import { SessionInfo } from "..";

export interface ServerToClientEvents {
    sessionInfo: (sessionInfo: SessionInfo) => void
}

export interface ClientToServerEvents {
    getDeviceId: (callback: (deviceId: number | Error) => void) => void
    logout: () => void
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    phoneNumber: string;
    device: string;
}
