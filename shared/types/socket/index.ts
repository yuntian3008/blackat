import { Types } from "mongoose";
import { BundleRequirement, LoggedInfo, Server, SessionInfo, Signal, SocketEvent } from "..";

export interface ServerToClientEvents {
    requireBundle: (requirement: BundleRequirement) => void,
    logged: (info: LoggedInfo) => void,
    sessionInfo: (sessionInfo: SessionInfo) => void
    // inComingMessage: (sender: Signal.Types.SignalProtocolAddress, message: Server.Message, callback: (inComingMessageResult: SocketEvent.InComingMessageResult) => void) => void
    // sendMailbox:  (messages: Array<Server.Mail> , callback: (inComingMessageResult: SocketEvent.InComingMessageResult) => void) => void
    newMessage: () => void
}

export interface ClientToServerEvents {
    online: () => void,
    checkMailbox: (callback: (messages: Array<Server.Mail>) => void) => void,
    isSomeOneThere: (phoneNumber: string, callback: (result: boolean) => void) => void,
    uploadIdentityKey: (identityKey: Signal.Types.IdentityKey, callback: (result: boolean) => void) => void
    uploadSignedPreKey: (signedPreKey: Signal.Types.SignedPreKey, callback: (result: boolean) => void) => void
    uploadPreKeys: (prekeys: Array<Signal.Types.PreKey>, callback: (result: boolean) => void) => void
    getDeviceId: (callback: (deviceId: number | Error) => void) => void
    getPreKeyBundle: (address: Signal.Types.SignalProtocolAddress, callback: (preKeyBundle: Signal.Types.PreKeyBundle) => void) => void,
    logout: () => void
    // outGoingMessage: (sender: Signal.Types.SignalProtocolAddress, address: Signal.Types.SignalProtocolAddress, message: Server.Message, callback: (outGoingMessageResult: SocketEvent.OutGoingMessageResult) => void) => void
    outGoingMessage: (sender: Signal.Types.SignalProtocolAddress, mails: Array<Server.MessagePackage>, callback: (success: boolean) => void) => void
    deleteMail: (mailId: string) => void
    getAddresses: (e164: string, callback: (addresses: Array<Signal.Types.SignalProtocolAddress>) => void) => void
    removeDevice: (callback: () => void) => void
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    phoneNumber: string;
    deviceObjectId: Types.ObjectId
    device: string;
    logged: LoggedInfo
    bundleRequirement: BundleRequirement
}
