package com.blackat.chat.test

import org.signal.libsignal.metadata.SealedSessionCipher.DecryptionResult
import org.signal.libsignal.protocol.DuplicateMessageException
import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.InvalidKeyException
import org.signal.libsignal.protocol.InvalidMessageException
import org.signal.libsignal.protocol.InvalidVersionException
import org.signal.libsignal.protocol.LegacyMessageException
import org.signal.libsignal.protocol.NoSessionException
import org.signal.libsignal.protocol.SessionCipher
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.UntrustedIdentityException
import org.signal.libsignal.protocol.ecc.Curve
import org.signal.libsignal.protocol.message.CiphertextMessage
import org.signal.libsignal.protocol.message.SignalMessage
import org.signal.libsignal.protocol.state.SessionRecord
import org.signal.libsignal.protocol.state.SignalProtocolStore
import java.security.NoSuchAlgorithmException
import java.util.Arrays
import kotlin.system.measureTimeMillis


class Test {
    class PairOfSessions(var aliceSession: SessionRecord, var bobSession: SessionRecord)
    class TestResult(
            val failed: Int,
            val encryptionResult: Double,
            val decryptionResult: Double,
    )
    fun getRandomString(length: Int) : String {
        val allowedChars = ('A'..'Z') + ('a'..'z') + ('0'..'9')
        return (1..length)
                .map { allowedChars.random() }
                .joinToString("")
    }

    @Throws(InvalidKeyException::class)
    public fun initializeSessionsV3(): PairOfSessions {
        val aliceIdentityKeyPair = Curve.generateKeyPair()
        val aliceIdentityKey = IdentityKeyPair(IdentityKey(aliceIdentityKeyPair.publicKey),
                aliceIdentityKeyPair.privateKey)
        val aliceBaseKey = Curve.generateKeyPair()
        val aliceEphemeralKey = Curve.generateKeyPair()
        val alicePreKey = aliceBaseKey
        val bobIdentityKeyPair = Curve.generateKeyPair()
        val bobIdentityKey = IdentityKeyPair(IdentityKey(bobIdentityKeyPair.publicKey),
                bobIdentityKeyPair.privateKey)
        val bobBaseKey = Curve.generateKeyPair()
        val bobPreKey = Curve.generateKeyPair()
        val aliceSessionRecord = SessionRecord.initializeAliceSession(aliceIdentityKey,
                aliceBaseKey,
                bobIdentityKey.publicKey,
                bobBaseKey.publicKey,
                bobBaseKey.publicKey)
        val bobSessionRecord = SessionRecord.initializeBobSession(bobIdentityKey,
                bobBaseKey,
                bobBaseKey,
                aliceIdentityKey.publicKey,
                aliceBaseKey.publicKey)
        return PairOfSessions(aliceSessionRecord, bobSessionRecord)
    }

    @Throws(DuplicateMessageException::class, LegacyMessageException::class, InvalidMessageException::class, InvalidVersionException::class, InvalidKeyException::class, NoSuchAlgorithmException::class, NoSessionException::class, UntrustedIdentityException::class)
    public fun runTest(pairOfSessions: PairOfSessions, time: Int, data: ByteArray): TestResult {

        val aliceSessionRecord = pairOfSessions.aliceSession
        val bobSessionRecord = pairOfSessions.bobSession

        val aliceStore: SignalProtocolStore = TestInMemorySignalProtocolStore()
        val bobStore: SignalProtocolStore = TestInMemorySignalProtocolStore()

        aliceStore.storeSession(SignalProtocolAddress("+14159999999", 1), aliceSessionRecord)
        bobStore.storeSession(SignalProtocolAddress("+14158888888", 1), bobSessionRecord)

        val aliceCipher = SessionCipher(aliceStore, SignalProtocolAddress("+14159999999", 1))
        val bobCipher = SessionCipher(bobStore, SignalProtocolAddress("+14158888888", 1))


//        PART 1
        var failed = 0
        var partOneTime = time/2
        var partOneSumTimeEncrypt = 0L
        var partOneSumTimeDecrypt = 0L
        for (i in 1..time/2) {
            var message: CiphertextMessage
            var bobPlaintext: ByteArray
            val encryptTime = measureTimeMillis {
                message = aliceCipher.encrypt(data)
            }
            val decryptTime = measureTimeMillis {
                bobPlaintext = bobCipher.decrypt(SignalMessage(message.serialize()))
            }
            if (data.contentEquals(bobPlaintext)) {
                partOneSumTimeEncrypt += encryptTime
                partOneSumTimeDecrypt += decryptTime
            }
            else {
                failed += 1
                partOneTime -= 1
            }
        }
        val partOneEncryptResult = partOneSumTimeEncrypt.toDouble() / partOneTime
        val partOneDecryptResult = partOneSumTimeDecrypt.toDouble() / partOneTime

//        PART 2

        var failed2 = 0
        var partTwoTime = time/2
        var partTwoSumTimeEncrypt = 0L
        var partTwoSumTimeDecrypt = 0L
        for (i in 1..time/2) {
            var reply: CiphertextMessage
            var receivedReply: ByteArray
            val encryptTime = measureTimeMillis {
                reply = bobCipher.encrypt(data)
            }
            val decryptTime = measureTimeMillis {
                receivedReply = aliceCipher.decrypt(SignalMessage(reply.serialize()))
            }
            if (data.contentEquals(receivedReply)) {
                partTwoSumTimeEncrypt += encryptTime
                partTwoSumTimeDecrypt += decryptTime
            }
            else {
                failed2 += 1
                partTwoTime -= 1
            }
        }
        val partTwoEncryptResult = partTwoSumTimeEncrypt.toDouble() / partTwoTime
        val partTwoDecryptResult = partTwoSumTimeDecrypt.toDouble() / partTwoTime


        val totalFailed = failed + failed2
        val encryptResult = (partOneEncryptResult + partTwoEncryptResult) / 2
        val decryptResult = (partOneDecryptResult + partTwoDecryptResult) / 2
        return TestResult(
                totalFailed,
                encryptResult,
                decryptResult
        )
    }
}