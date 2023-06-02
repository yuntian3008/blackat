package com.blackat.chat.signal.storage

import com.blackat.chat.data.repository.SignalRepository
import kotlinx.coroutines.runBlocking
import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.groups.state.InMemorySenderKeyStore
import org.signal.libsignal.protocol.groups.state.SenderKeyRecord
import org.signal.libsignal.protocol.state.*
import org.signal.libsignal.protocol.state.impl.InMemoryPreKeyStore
import org.signal.libsignal.protocol.state.impl.InMemorySessionStore
import org.signal.libsignal.protocol.state.impl.InMemorySignedPreKeyStore
import java.util.*


class SignalStore: SignalProtocolStore {

    override fun getIdentityKeyPair(): IdentityKeyPair = runBlocking {
        SignalRepository.account().getIdentityKeyPair()
    }

    override fun getLocalRegistrationId(): Int = runBlocking{
        SignalRepository.account().getRegistrationId()
    }

    override fun saveIdentity(address: SignalProtocolAddress, identityKey: IdentityKey): Boolean = runBlocking {
        SignalRepository.signalIdentityKey().saveIdentity(address,identityKey)
    }

    override fun isTrustedIdentity(address: SignalProtocolAddress, identityKey: IdentityKey, direction: IdentityKeyStore.Direction): Boolean = runBlocking {
        SignalRepository.signalIdentityKey().isTrustedIdentity(address,identityKey,direction)
    }

    override fun getIdentity(address: SignalProtocolAddress): IdentityKey? = runBlocking {
        SignalRepository.signalIdentityKey().getIdentity(address)
    }

    override fun loadPreKey(preKeyId: Int): PreKeyRecord = runBlocking{
        SignalRepository.signalPreKey().loadPreKey(preKeyId)
    }

    override fun storePreKey(preKeyId: Int, record: PreKeyRecord) = runBlocking {
        SignalRepository.signalPreKey().storePreKey(preKeyId,record)
    }

    override fun containsPreKey(preKeyId: Int): Boolean = runBlocking {
        SignalRepository.signalPreKey().containsPreKey(preKeyId)
    }

    override fun removePreKey(preKeyId: Int) = runBlocking{
        SignalRepository.signalPreKey().removePreKey(preKeyId)
    }

    override fun loadSession(address: SignalProtocolAddress): SessionRecord? = runBlocking {
        SignalRepository.signalSession().loadSession(address)
    }

    override fun loadExistingSessions(addresses: MutableList<SignalProtocolAddress>): MutableList<SessionRecord> = runBlocking {
        SignalRepository.signalSession().loadExistingSessions(addresses)
    }

    override fun getSubDeviceSessions(name: String): MutableList<Int> = runBlocking {
        SignalRepository.signalSession().getSubDeviceSessions(name)
    }

    override fun storeSession(address: SignalProtocolAddress, record: SessionRecord) = runBlocking {
        SignalRepository.signalSession().storeSession(address,record)
    }

    override fun containsSession(address: SignalProtocolAddress): Boolean = runBlocking {
        SignalRepository.signalSession().containsSession(address)
    }

    override fun deleteSession(address: SignalProtocolAddress) = runBlocking {
        SignalRepository.signalSession().deleteSession(address)
    }

    override fun deleteAllSessions(name: String) = runBlocking {
        SignalRepository.signalSession().deleteAllSessions(name)
    }

    override fun loadSignedPreKey(signedPreKeyId: Int): SignedPreKeyRecord = runBlocking{
        SignalRepository.signalSignedPreKey().loadSignedPreKey(signedPreKeyId)
    }

    override fun loadSignedPreKeys(): MutableList<SignedPreKeyRecord> = runBlocking {
        SignalRepository.signalSignedPreKey().loadSignedPreKeys()
    }

    override fun storeSignedPreKey(signedPreKeyId: Int, record: SignedPreKeyRecord) = runBlocking {
        SignalRepository.signalSignedPreKey().storeSignedPreKey(signedPreKeyId,record)
    }

    override fun containsSignedPreKey(signedPreKeyId: Int): Boolean = runBlocking {
        SignalRepository.signalSignedPreKey().containsSignedPreKey(signedPreKeyId)
    }

    override fun removeSignedPreKey(signedPreKeyId: Int) = runBlocking {
        SignalRepository.signalSignedPreKey().removeSignedPreKey(signedPreKeyId)
    }

    override fun storeSenderKey(sender: SignalProtocolAddress?, distributionId: UUID?, record: SenderKeyRecord?) {
        TODO("Not yet implemented")
    }

    override fun loadSenderKey(sender: SignalProtocolAddress?, distributionId: UUID?): SenderKeyRecord {
        TODO("Not yet implemented")
    }

}