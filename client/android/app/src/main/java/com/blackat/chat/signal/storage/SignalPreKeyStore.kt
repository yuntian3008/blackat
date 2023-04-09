package com.blackat.chat.signal.storage

import com.blackat.chat.data.dao.OneTimePreKeyDao
import com.blackat.chat.data.dao.SignedPreKeyDao
import com.blackat.chat.data.model.ECKeyPairModel
import com.blackat.chat.data.model.OneTimePreKey
import com.blackat.chat.data.model.SignedPreKey
import org.signal.libsignal.protocol.ecc.ECKeyPair
import org.signal.libsignal.protocol.state.*

class SignalPreKeyStore(
        private val preKeyStore: OneTimePreKeyDao,
        private val signedPreKeyStore: SignedPreKeyDao
) {
    suspend fun loadPreKey(preKeyId: Int): PreKeyRecord =
            preKeyStore.get(preKeyId)

    suspend fun storePreKey(preKeyId: Int, preKeyRecord: PreKeyRecord) =
            preKeyStore.insert(OneTimePreKey(preKeyId, preKeyRecord.keyPair as ECKeyPairModel))

    suspend fun containsPreKey(preKeyId: Int): Boolean =
            preKeyStore.contain(preKeyId)

    suspend fun removePreKey(preKeyId: Int) =
            preKeyStore.delete(preKeyId)

    suspend fun loadSignedPreKey(signedPreKeyId: Int): SignedPreKeyRecord =
            signedPreKeyStore.get(signedPreKeyId)

    suspend fun loadSignedPreKeys(): List<SignedPreKey> =
            signedPreKeyStore.getAll()

    suspend fun storeSignedPreKey(signedPreKeyId: Int, signedPreKeyRecord: SignedPreKeyRecord) =
            signedPreKeyStore.insert(SignedPreKey(signedPreKeyId,
                    signedPreKeyRecord.timestamp,
                    signedPreKeyRecord.keyPair as ECKeyPairModel,
                    signedPreKeyRecord.signature
            ))

    suspend fun containsSignedPreKey(signedPreKeyId: Int): Boolean =
            signedPreKeyStore.contain(signedPreKeyId)

    suspend fun removeSignedPreKey(signedPreKeyId: Int) =
            signedPreKeyStore.delete(signedPreKeyId)


}