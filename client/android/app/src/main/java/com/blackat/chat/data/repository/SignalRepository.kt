package com.blackat.chat.data.repository

import android.app.Application
import androidx.annotation.NonNull
import com.blackat.chat.MainApplication
import com.blackat.chat.data.dao.KeyValueDao
import com.blackat.chat.data.database.SignalDatabase
import com.blackat.chat.signal.crypto.IdentityKeyUtil
import com.blackat.chat.signal.storage.*
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.ecc.Curve
import org.signal.libsignal.protocol.ecc.ECKeyPair
import org.signal.libsignal.protocol.message.PreKeySignalMessage
import org.signal.libsignal.protocol.state.PreKeyRecord
import org.signal.libsignal.protocol.state.SignedPreKeyRecord
import org.signal.libsignal.protocol.util.Medium
import java.security.SecureRandom


class SignalRepository(signalDatabase: SignalDatabase) {
    private val accountStore: AccountStore = AccountStore(signalDatabase.keyValueDao())
    private val signalIdentityKeyStore: SignalIdentityKeyStore = SignalIdentityKeyStore(signalDatabase.identityDao())
    private val signalPreKeyStore: SignalPreKeyStore = SignalPreKeyStore(signalDatabase.oneTimePreKeyDao())
    private val signalSignedPreKeyStore: SignalSignedPreKeyStore = SignalSignedPreKeyStore(signalDatabase.signedPreKeyDao())
    private val signalSessionStore: SignalSessionStore = SignalSessionStore(signalDatabase.sessionDao())
    private val signalStore: SignalStore = SignalStore()
    private val database = signalDatabase

    companion object {
        @Volatile
        private var instance: SignalRepository? = null

        private
        fun getInstance(): SignalRepository {
            if (instance == null) {
                synchronized(SignalRepository::class.java) {
                    if (instance == null) {
                        val signalDatabase = SignalDatabase.getInstance(MainApplication.getApplication())
                        instance = SignalRepository(signalDatabase)
                    }
                }
            }
            return instance!!
        }

        suspend fun onFirstEverAppLaunch(): Boolean =
                try {
                    account().generateIdentityKeyPairIfNecessary()
                    account().generateRegistrationIdIfNecessary()
                    account().generateNextOneTimePreKeyIdIfNecessary()
                    account().generateNextSignedPreKeyIdIfNecessary()
                    true
                } catch (_: Exception) {
                    false
                }

        suspend fun resetApp(): Boolean =
                try {
                    account().regenerateIdentityKeyPair()
                    account().regenerateRegistrationId()
                    account().regenerateNextOneTimePreKeyId()
                    account().regenerateNextSignedPreKeyId()
                    account().resetE164()
                    account().resetLocalDeviceId()
                    account().resetProfileAvatar()
                    account().resetProfileName()
                    account().resetPin()
                    signalSession().clear()
                    signalIdentityKey().clear()
                    signalSignedPreKey().clear()
                    signalPreKey().clear()
                    AppRepository.privateMessage().clear()
                    AppRepository.privateConversation().clear()
                    AppRepository.partner().clear()
                    true
                } catch (_: Exception) {
                    false
                }



        suspend fun account() = getInstance().accountStore
        suspend fun signalIdentityKey() = getInstance().signalIdentityKeyStore
        suspend fun signalPreKey() = getInstance().signalPreKeyStore
        suspend fun signalSignedPreKey() = getInstance().signalSignedPreKeyStore
        suspend fun signalSession() = getInstance().signalSessionStore
        suspend fun signalStore() = getInstance().signalStore
        suspend fun clearAllTables() {
            getInstance().database.identityDao().deleteAll()
            getInstance().database.sessionDao().deleteAllTable()
        }
    }
}