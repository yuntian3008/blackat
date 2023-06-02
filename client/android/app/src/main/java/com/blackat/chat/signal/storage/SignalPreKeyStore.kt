package com.blackat.chat.signal.storage

import com.blackat.chat.data.dao.OneTimePreKeyDao
import com.blackat.chat.data.dao.SignedPreKeyDao
import com.blackat.chat.data.model.ECKeyPairModel
import com.blackat.chat.data.model.OneTimePreKey
import com.blackat.chat.data.model.SignedPreKey
import kotlinx.coroutines.runBlocking
import org.signal.libsignal.protocol.InvalidKeyIdException
import org.signal.libsignal.protocol.ecc.ECKeyPair
import org.signal.libsignal.protocol.state.*

class SignalPreKeyStore(
        private val preKeyStore: OneTimePreKeyDao,
) : PreKeyStore {
    override fun loadPreKey(preKeyId: Int): PreKeyRecord  = runBlocking {
        if (!preKeyStore.contain(preKeyId))
            throw InvalidKeyIdException("no such prekeyrecord!")
        preKeyStore.get(preKeyId).getPreKeyRecord()
    }

    override fun storePreKey(preKeyId: Int, preKeyRecord: PreKeyRecord) = runBlocking {
        preKeyStore.insert(OneTimePreKey(preKeyId,preKeyRecord))
    }

    override fun containsPreKey(preKeyId: Int): Boolean  = runBlocking {
        preKeyStore.contain(preKeyId)
    }

    override fun removePreKey(preKeyId: Int)  = runBlocking {
        preKeyStore.delete(preKeyId)
    }

    fun clear() = runBlocking {
        preKeyStore.clear()
    }
}