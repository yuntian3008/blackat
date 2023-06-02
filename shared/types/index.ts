export type SessionInfo = {
    deviceId: number,
}

export type LoggedInfo = {
    e164: string,
    isNewUser: boolean,
    isNewDevice: boolean,
    deviceId: number
}

export type BundleRequirement = {
    needIdentityKey: boolean,
    needSignedPreKey: boolean,
    needPreKeys: boolean
}

export type IdentityKey = string

export type SignedPreKey = {
    keyId: number,
    publicKey: string,
    signature: string,
}

export type PreKey = {
    keyId: number,
    publicKey: string
}

export type PreKeyBundle = {
    identityKey: IdentityKey,
    signedPreKey: SignedPreKey,
    prekeys: Array<PreKey>
}

export type KeyBundle = {
    identityKey: IdentityKey,
    signedPreKey: SignedPreKey,
    prekey: PreKey
}

export namespace SocketEvent {
    export namespace V2 {
        export type OutGoingMessageCallback = string
    }
    export namespace SendAt {
        export const FAILED = -1
        export const DEVICE = 0
        export const MAILBOX = 1
    }
    export type InComingMessageResult = {
        isProcessed: boolean
    }
    export type OutGoingMessageResult = {
        sentAt: number,
    }
}

export namespace App {
    export namespace MessageType {
        export const TEXT = 0
        export const IMAGE = 1
        export const STICKER = 2
        export const EMPTY = -1
        export const PROFILE = -2
    }
    export namespace MessageOwner {
        export const SELF = "SELF"
        export const PARTNER = "PARTNER"
    }
    export namespace MessageState {
        export const SENT = "SENT"
        export const SENDING = "SENDING"
        export const UNKNOWN = "UNKNOWN"
        export const READ = "READ"
        export const UNREAD = "UNREAD"
        export const ERROR = "ERROR"
    }
    export namespace Types {
        export type Profile = {
            name?: string | null,
            avatar?: string | null,
            e164?: string,
        }
        export type DialogData = {
            icon: string,
            title: string,
            content: string,
            cancel?: () => void,
            ok?: () => void,
        }
        export type Partner = {
            id: number,
            e164: string,
            name?: string,
            deviceId: number,
            avatar?: string,
            nickname?: string,
        }
        export type Conversation = {
            id: number,
            e164: string,
            enablePinSecurity: boolean,
            allowNotification: boolean,
        }
        export type MessageData = {
            owner: string,
            data: string,
            type: number,
            timestamp: string,
            senderDevice: number,
            state?: string,
        }
        export type Message = {
            id: number,
            conversationId: number
            message: MessageData
        }
        export type MessageWithE164 = {
            id: number,
            message: MessageData,
            fileInfo? : Server.FileInfo
            e164: string
        }
        export type ConversationWithMessages = {
            messages: Array<Message>
            state: string,
            conversation: Conversation
            partner: Partner
        }
    }
}

export namespace Server {
    export type CipherMessage = {
        cipher: string,
        type: number,
    }
    export type FileInfo = {
        name?: string,
        type?: string,
        size?: number
    }
    export type Message = {
        data: CipherMessage,
        fileInfo?: FileInfo,
        type: number,
        timestamp: string,
    }
    export type Mail = {
        id: string,
        sender: Signal.Types.SignalProtocolAddress,
        message: Message
    }
    export type MessagePackage = {
        address: Signal.Types.SignalProtocolAddress,
        message: Message
    }
}

export interface SignalError {
    code: string,
    message?: string,
    stack?: string,
}

export namespace Signal {
    export namespace Types {
        export type Fingerprint = {
            qrContent: string,
            displayText: string,
        }
        export type SignalProtocolAddress = {
            e164: string,
            deviceId: number
        }
        export type PreKeyBundle = {
            registrationId: number,
            deviceId: number,
            identityKey: string,
            signedPreKey: SignedPreKey,
            preKey: PreKey
        }
        export type PreKey = {
            id: number,
            key: string,
        }
        export type SignedPreKey = {
            id: number,
            key: string,
            signature: string
        }
        export type IdentityKey = string
    }
    
}