package com.blackat.chat.signal.crypto

import android.util.Log
import com.blackat.chat.data.repository.SignalRepository
import org.signal.libsignal.protocol.InvalidKeyException
import org.signal.libsignal.protocol.ecc.Curve
import org.signal.libsignal.protocol.ecc.ECKeyPair
import org.signal.libsignal.protocol.ecc.ECPrivateKey
import org.signal.libsignal.protocol.state.PreKeyBundle
import org.signal.libsignal.protocol.state.PreKeyRecord
import org.signal.libsignal.protocol.state.SignedPreKeyRecord
import org.signal.libsignal.protocol.util.Medium
import java.util.*


class PreKeyUtil {
    companion object {
        private const val BATCH_SIZE = 100
        suspend fun generateAndStoreOneTimePreKeys(): List<PreKeyRecord> {
            Log.i("OneTimePreKey", "Generating one-time prekeys...")
            val records: MutableList<PreKeyRecord> = LinkedList()
            val preKeyIdOffset: Int = SignalRepository.account().getNextOneTimePreKeyId()
            for (i in 0 until BATCH_SIZE) {
                val preKeyId = (preKeyIdOffset + i) % Medium.MAX_VALUE
                val keyPair = Curve.generateKeyPair()
                val record = PreKeyRecord(preKeyId, keyPair)
                SignalRepository.signalPreKey().storePreKey(preKeyId,record)
                records.add(record)
            }
            SignalRepository.account().setNextOneTimePreKeyId((preKeyIdOffset + BATCH_SIZE + 1) % Medium.MAX_VALUE)
            return records
        }

        suspend fun generateAndStoreSignedPreKey(): SignedPreKeyRecord {
            Log.i("SignedPreKey", "Generating signed prekeys...")
            val signedPreKeyId: Int = SignalRepository.account().getNextSignedPreKeyId()
            val privateKey = SignalRepository.account().getIdentityKeyPair().privateKey
            val record = generateSignedPreKey(signedPreKeyId,privateKey)

            SignalRepository.signalSignedPreKey().storeSignedPreKey(
                    signedPreKeyId,
                    record
            )

            SignalRepository.account().setNextSignedPreKeyId(
                    (signedPreKeyId + 1) % Medium.MAX_VALUE
            )

            return record
        }

        @Synchronized
        fun generateSignedPreKey(signedPreKeyId: Int, privateKey: ECPrivateKey): SignedPreKeyRecord {
            return try {
                val keyPair: ECKeyPair = Curve.generateKeyPair()
                val signature: ByteArray = Curve.calculateSignature(privateKey, keyPair.publicKey.serialize())
                SignedPreKeyRecord(signedPreKeyId, System.currentTimeMillis(), keyPair, signature)
            } catch (e: InvalidKeyException) {
                throw AssertionError(e)
            }
        }

        @Synchronized
        fun generateOneTimePreKey(oneTimePreKeyId: Int): PreKeyRecord? {
            return try {
                val keyPair: ECKeyPair = Curve.generateKeyPair()
                PreKeyRecord(oneTimePreKeyId,keyPair)
            } catch (e: InvalidKeyException) {
                throw AssertionError(e)
            }
        }
    }
}