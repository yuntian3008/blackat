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
        export const EMPTY = -1
    }
    export namespace MessageOwner {
        export const SELF = "SELF"
        export const PARTNER = "PARTNER"
    }
    export namespace Types {
        export type Conversation = {
            id: number,
            e164: string,
        }
        export type MessageData = {
            owner: string,
            data: string,
            type: number,
            timestamp: string,
        }
        export type Message = {
            id: number,
            conversationId: number
            message: MessageData
        }
        export type ConversationWithMessages = {
            messages: Array<Message>
            conversation: Conversation
        }
    }
}

export namespace Server {
    export type CipherMessage = {
        cipher: string,
        type: number,
    }
    export type Message = {
        data: CipherMessage,
        type: number,
        timestamp: string,
    }
    export type Mail = {
        sender: Signal.Types.SignalProtocolAddress,
        message: Message
    }
}

export interface SignalError {
    code: string,
    message?: string,
}

export namespace Signal {
    export namespace Types {
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