package com.blackat.chat.signal.storage

import com.blackat.chat.data.dao.OneTimePreKeyDao
import com.blackat.chat.data.dao.SessionDao
import com.blackat.chat.data.model.Address
import com.blackat.chat.data.model.Session
import kotlinx.coroutines.runBlocking
import org.signal.libsignal.protocol.SessionCipher
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.state.SessionRecord
import org.signal.libsignal.protocol.state.SessionStore

class SignalSessionStore(
        private val store: SessionDao,
): SessionStore {
    companion object {
        private const val DEFAULT_DEVICE_ID = 1
    }
    override fun loadSession(address: SignalProtocolAddress): SessionRecord? = runBlocking {
        val sessionRecord = SessionRecord()
        store.get(address.name,address.deviceId)?.record
    }

    override fun loadExistingSessions(addresses: MutableList<SignalProtocolAddress>): MutableList<SessionRecord> {
        val sessions = mutableListOf<SessionRecord>()
        addresses.forEach() {
            loadSession(it)?.let { it1 -> sessions.add(it1) } ?: throw AssertionError("Failed to find one or more sessions")
        }

        return sessions
    }

    override fun getSubDeviceSessions(name: String): MutableList<Int> = runBlocking {
        store.getSubDevice(name, DEFAULT_DEVICE_ID)
    }

    override fun storeSession(address: SignalProtocolAddress, record: SessionRecord) = runBlocking {
        store.upsert(Session(Address(address),record))
    }

    override fun containsSession(address: SignalProtocolAddress): Boolean = runBlocking {
        store.contain(address.name, address.deviceId)
    }

    override fun deleteSession(address: SignalProtocolAddress) = runBlocking {
        store.delete(address.name,address.deviceId)
    }

    override fun deleteAllSessions(name: String) = runBlocking {
        store.deleteAll(name)
    }

    fun clear() = runBlocking {
        store.clear()
    }
}