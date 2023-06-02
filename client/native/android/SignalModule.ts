import { CountryCode } from "libphonenumber-js/types"
import { NativeModules } from "react-native"
import { App, Server, Signal, SignalError } from "../../../shared/types"

const { SignalModule } = NativeModules



interface SignalModuleInterface {
    getConstants(): {
        CURRENT_COUNTRY_CODE: CountryCode
    }
    // testBasicPreKeyV3(): void
    clearAllTables(): Promise<void>
    logout: () => void
    logged(phonenumber: String, deviceId: number): void
    onFirstEverAppLaunch(): Promise<boolean>
    requireIdentityKey(): Promise<Signal.Types.IdentityKey>
    requireOneTimePreKey(): Promise<Array<Signal.Types.PreKey>>
    requireSignedPreKey(): Promise<Signal.Types.SignedPreKey>
    requireRegistrationId(): Promise<number>
    performKeyBundle(e164: string, preKeyBundle: Signal.Types.PreKeyBundle): Promise<boolean>
    encrypt(address: Signal.Types.SignalProtocolAddress, data: String): Promise<Server.CipherMessage>
    encryptFile(address: Signal.Types.SignalProtocolAddress, uri: String): Promise<Server.CipherMessage>
    decrypt(address: Signal.Types.SignalProtocolAddress, cipher: Server.CipherMessage, forcePreKey: boolean): Promise<string|SignalError>
    decryptFile(address: Signal.Types.SignalProtocolAddress, cipher: Server.CipherMessage, fileInfo: Server.FileInfo, forcePreKey: boolean): Promise<string|SignalError|null>
    missingSession(addresses: Array<Signal.Types.SignalProtocolAddress>): Promise<Array<Signal.Types.SignalProtocolAddress>>
    requireLocalAddress(): Promise<Signal.Types.SignalProtocolAddress>

    requireFingerprint(e164: string): Promise<Signal.Types.Fingerprint>
    compareFingerprint(qrContent: string, e164: string): Promise<boolean>

    updateProfile(profile: App.Types.Profile): Promise<boolean>
    getProfile(): Promise<App.Types.Profile>

    onRemoveAccount(): Promise<boolean>

    // test
    testPerformance(data: string): Promise<string>
}

export default SignalModule as SignalModuleInterface