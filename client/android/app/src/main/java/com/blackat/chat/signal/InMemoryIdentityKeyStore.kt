package com.blackat.chat.signal

import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.state.IdentityKeyStore


class InMemoryIdentityKeyStore(private val identityKeyPair: IdentityKeyPair, private val localRegistrationId: Int) : IdentityKeyStore {
    private val trustedKeys: MutableMap<SignalProtocolAddress, IdentityKey> = HashMap()
    override fun getIdentityKeyPair(): IdentityKeyPair {
        return identityKeyPair
    }

    override fun getLocalRegistrationId(): Int {
        return localRegistrationId
    }

    override fun saveIdentity(address: SignalProtocolAddress, identityKey: IdentityKey): Boolean {
        val existing = trustedKeys[address]
        return if (identityKey != existing) {
            trustedKeys[address] = identityKey
            true
        } else {
            false
        }
    }

    override fun isTrustedIdentity(address: SignalProtocolAddress, identityKey: IdentityKey, direction: IdentityKeyStore.Direction): Boolean {
        val trusted = trustedKeys[address]
        return (trusted == null) || (trusted == identityKey)
    }

    override fun getIdentity(address: SignalProtocolAddress): IdentityKey {
        return trustedKeys[address]!!
    }
}
