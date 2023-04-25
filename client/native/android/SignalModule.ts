import { CountryCode } from "libphonenumber-js/types"
import { NativeModules } from "react-native"
import { Server, Signal } from "../../../shared/types"

const { SignalModule } = NativeModules



interface SignalModuleInterface {
    getConstants(): {
        CURRENT_COUNTRY_CODE: CountryCode
    }
    testBasicPreKeyV3(): void
    clearAllTables(): Promise<void>
    logged(phonenumber: String, deviceId: number): void
    onFirstEverAppLaunch(): Promise<boolean>
    requireIdentityKey(): Promise<Signal.Types.IdentityKey>
    requireOneTimePreKey(): Promise<Array<Signal.Types.PreKey>>
    requireSignedPreKey(): Promise<Signal.Types.SignedPreKey>
    requireRegistrationId(): Promise<number>
    performKeyBundle(e164: string, preKeyBundle: Signal.Types.PreKeyBundle): Promise<boolean>
    encrypt(address: Signal.Types.SignalProtocolAddress, data: String): Promise<Server.CipherMessage>
    decrypt(address: Signal.Types.SignalProtocolAddress, cipher: Server.CipherMessage): Promise<string>
    missingSession(addresses: Array<Signal.Types.SignalProtocolAddress>): Promise<Array<Signal.Types.SignalProtocolAddress>>
    requireLocalAddress(): Promise<Signal.Types.SignalProtocolAddress>
}

export default SignalModule as SignalModuleInterface