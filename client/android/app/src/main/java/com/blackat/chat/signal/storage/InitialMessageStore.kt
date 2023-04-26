package com.blackat.chat.signal.storage

import com.blackat.chat.data.dao.InitialMessageDao
import com.blackat.chat.data.dao.OneTimePreKeyDao
import org.signal.libsignal.protocol.SignalProtocolAddress

class InitialMessageStore(
        private val initialMessageDao: InitialMessageDao,
) {
    suspend fun isCompleted(address: SignalProtocolAddress): Boolean? {
        val isEncrypted = initialMessageDao.isEncrypted(address.name,address.deviceId)
        val isDecrypted = initialMessageDao.isDecrypted(address.name,address.deviceId)
        isEncrypted ?: return null
        isDecrypted ?: return null
        return isEncrypted && isDecrypted
    }

    suspend fun setEncrypted(address: SignalProtocolAddress): Boolean {
        val initialMessage = initialMessageDao.get(address.name, address.deviceId)
        initialMessage?: return false

        initialMessage.encrypted = true
        initialMessageDao.upsert(initialMessage)
        return true
    }

    suspend fun setDecrypted(address: SignalProtocolAddress): Boolean {
        val initialMessage = initialMessageDao.get(address.name, address.deviceId)
        initialMessage?: return false

        initialMessage.decrypted = true
        initialMessageDao.upsert(initialMessage)
        return true
    }
}