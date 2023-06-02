package com.blackat.chat.signal.storage

import android.content.Context
import com.blackat.chat.data.dao.IdentityKeyDao
import com.blackat.chat.data.model.Address
import com.blackat.chat.data.repository.SignalRepository
import kotlinx.coroutines.runBlocking
import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.state.IdentityKeyStore
import org.signal.libsignal.protocol.state.SignalProtocolStore
import org.signal.libsignal.protocol.state.impl.InMemoryIdentityKeyStore

class SignalIdentityKeyStore(private val store: IdentityKeyDao): IdentityKeyStore {
    override fun getIdentityKeyPair(): IdentityKeyPair = runBlocking {
        SignalRepository.account().getIdentityKeyPair()
    }

    override fun getLocalRegistrationId(): Int = runBlocking {
        SignalRepository.account().getRegistrationId()
    }

    override fun saveIdentity(address: SignalProtocolAddress, identityKey: IdentityKey): Boolean = runBlocking {
        try {
            store.put(com.blackat.chat.data.model.IdentityKey(Address(address), identityKey.serialize()))
            true
        } catch (e: Exception) {
            false
        }
    }

    override fun isTrustedIdentity(address: SignalProtocolAddress, identityKey: IdentityKey, direction: IdentityKeyStore.Direction): Boolean = runBlocking {
        val isSelf = address.name.equals(SignalRepository.account().getE164())

        if (isSelf)
            return@runBlocking identityKey.publicKey.equals(SignalRepository.account().getIdentityKeyPair().publicKey)

        when (direction) {
            IdentityKeyStore.Direction.RECEIVING -> return@runBlocking true
            IdentityKeyStore.Direction.SENDING -> {
                val record = getIdentity(address) ?: return@runBlocking true

                if (record != identityKey) return@runBlocking false
            }
            else -> throw AssertionError("Unknown direction: $direction")
        }

        return@runBlocking true
    }

    override fun getIdentity(address: SignalProtocolAddress): IdentityKey? = runBlocking {
        val byte = store.get(address.name,address.deviceId) ?: return@runBlocking  null
        return@runBlocking IdentityKey(byte)
    }

    fun clear() = runBlocking {
        store.clear()
    }

}