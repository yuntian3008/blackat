package com.blackat.chat.signal.storage

import com.blackat.chat.data.dao.SignedPreKeyDao
import com.blackat.chat.data.model.SignedPreKey
import kotlinx.coroutines.runBlocking
import org.signal.libsignal.protocol.state.SignedPreKeyRecord
import org.signal.libsignal.protocol.state.SignedPreKeyStore

class SignalSignedPreKeyStore(private val signedPreKeyStore: SignedPreKeyDao): SignedPreKeyStore {
    override fun loadSignedPreKey(signedPreKeyId: Int): SignedPreKeyRecord = runBlocking {
        signedPreKeyStore.get(signedPreKeyId).getSignedPreKeyRecord()
    }

    override fun loadSignedPreKeys(): MutableList<SignedPreKeyRecord> = runBlocking {
        signedPreKeyStore.getAll().map { it.getSignedPreKeyRecord() }.toMutableList()
    }

    override fun storeSignedPreKey(signedPreKeyId: Int, record: SignedPreKeyRecord) = runBlocking {
        signedPreKeyStore.insert(SignedPreKey(signedPreKeyId, record))
    }

    override fun containsSignedPreKey(signedPreKeyId: Int): Boolean = runBlocking {
        signedPreKeyStore.contain(signedPreKeyId)
    }

    override fun removeSignedPreKey(signedPreKeyId: Int) = runBlocking {
        signedPreKeyStore.delete(signedPreKeyId)
    }

    fun clear() = runBlocking {
        signedPreKeyStore.clear()
    }
}