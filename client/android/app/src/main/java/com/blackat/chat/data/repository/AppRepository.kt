package com.blackat.chat.data.repository

import android.app.Application
import androidx.annotation.NonNull
import com.blackat.chat.MainApplication
import com.blackat.chat.data.dao.KeyValueDao
import com.blackat.chat.data.database.AppDatabase
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


class AppRepository(appDatabase: AppDatabase) {
    private val privateConversationStore = PrivateConversationStore(
            appDatabase.privateConversationDao(),
            appDatabase.privateMessageDao(),
            appDatabase.partnerDao())
    private val privateMessageStore = PrivateMessageStore(appDatabase.privateMessageDao())
    private val partnerStore = PartnerStore(appDatabase.partnerDao())
    private val database = appDatabase
    companion object {
        @Volatile
        private var instance: AppRepository? = null

        private
        fun getInstance(): AppRepository {
            if (instance == null) {
                synchronized(AppRepository::class.java) {
                    if (instance == null) {
                        val appDatabase = AppDatabase.getInstance(MainApplication.getApplication())
                        instance = AppRepository(appDatabase)
                    }
                }
            }
            return instance!!
        }


        fun privateConversation() = getInstance().privateConversationStore
        fun privateMessage() = getInstance().privateMessageStore
        fun partner() = getInstance().partnerStore

        suspend fun clearAllTables() {
            getInstance().database.privateConversationDao().deleteAll()
            getInstance().database.privateMessageDao().deleteAll()
            getInstance().database.partnerDao().deleteAll()
        }
    }
}