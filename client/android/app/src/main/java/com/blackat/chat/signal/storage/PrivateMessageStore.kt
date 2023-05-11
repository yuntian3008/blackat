package com.blackat.chat.signal.storage

import com.blackat.chat.data.dao.MessageWithE164
import com.blackat.chat.data.dao.OneTimePreKeyDao
import com.blackat.chat.data.dao.PrivateConversationDao
import com.blackat.chat.data.dao.PrivateMessageDao
import com.blackat.chat.data.dao.SignedPreKeyDao
import com.blackat.chat.data.model.*
import kotlinx.coroutines.runBlocking
import org.signal.libsignal.protocol.ecc.ECKeyPair
import org.signal.libsignal.protocol.state.*

class PrivateMessageStore(
        private val store: PrivateMessageDao,
) {
    suspend fun save(message: Message, conversationId: Int) {
        store.insert(PrivateMessage(message,conversationId))
    }

    suspend fun test(): List<MessageWithE164> {
        return store.getMessagesWithState(MessageState.SENDING)
    }
}