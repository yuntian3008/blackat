package com.blackat.chat.data.repository

import android.app.Application
import androidx.annotation.NonNull
import com.blackat.chat.MainApplication
import com.blackat.chat.data.dao.KeyValueDao
import com.blackat.chat.data.database.SignalDatabase
import com.blackat.chat.signal.storage.AccountStore
import com.blackat.chat.signal.storage.SignalIdentityKeyStore
import com.blackat.chat.signal.storage.SignalPreKeyStore
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
    private val signalPreKeyStore: SignalPreKeyStore = SignalPreKeyStore(signalDatabase.oneTimePreKeyDao(),signalDatabase.signedPreKeyDao())

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
//        suspend fun onFirstEverAppLaunch(): Boolean {
//            val generateRegistrationId = account().generateRegistrationIdIfNecessary()
//            val saveNew = signalIdentityKey().saveIdentity()
//            val
//
//            return true
//        }

        suspend fun onLogged(phoneNumber: String, deviceId: Int): Boolean {
            val generateRegistrationIdIfNecessary = account().generateRegistrationIdIfNecessary()

            val signalProtocolAddress = SignalProtocolAddress(phoneNumber,deviceId)
            val identityKeyPair = IdentityKeyPair.generate()
            val generateIdentityKeyIfNecessary = signalIdentityKey().saveIdentity(signalProtocolAddress,identityKeyPair.publicKey)

            val r = SecureRandom().nextInt(Medium.MAX_VALUE)
            val preKeyPair = Curve.generateKeyPair()

            return generateRegistrationIdIfNecessary && generateIdentityKeyIfNecessary
        }

        suspend fun account() = getInstance().accountStore
        suspend fun signalIdentityKey() = getInstance().signalIdentityKeyStore
        suspend fun signalPreKey() = getInstance().signalPreKeyStore
    }
}