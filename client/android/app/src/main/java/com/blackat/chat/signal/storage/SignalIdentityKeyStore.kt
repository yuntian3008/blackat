package com.blackat.chat.signal.storage

import android.content.Context
import com.blackat.chat.data.dao.IdentityKeyDao
import com.blackat.chat.data.model.Address
import com.blackat.chat.data.repository.SignalRepository
import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.state.SignalProtocolStore
import org.signal.libsignal.protocol.state.impl.InMemoryIdentityKeyStore

class SignalIdentityKeyStore(private val store: IdentityKeyDao) {

    suspend fun getRegistrationId(): Int? = SignalRepository.account().getRegistrationId()

    suspend fun saveIdentity(address: SignalProtocolAddress, identityKey: IdentityKey): Boolean {
        return try {
            var inMemoryIdentityKey = store.get(address.name,address.deviceId)
            if (inMemoryIdentityKey == null) {
                inMemoryIdentityKey = identityKey.serialize()
                store.put(com.blackat.chat.data.model.IdentityKey(address as Address,inMemoryIdentityKey))
            }
            true
        } catch (_: Exception) {
            false
        }

    }

//    fun isTrustedIdentity(address: SignalProtocolAddress?, identityKey: IdentityKey?, direction: IdentityKeyStore.Direction?): Boolean {
//        TODO("Not yet implemented")
//    }

    suspend fun getIdentity(address: SignalProtocolAddress): IdentityKey? {
        val bytes = store.get(address.name,address.deviceId)
        return bytes?.let { IdentityKey(bytes) }
    }
}