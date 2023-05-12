package com.blackat.chat.signal.storage

import com.blackat.chat.data.dao.MessageWithE164
import com.blackat.chat.data.dao.PrivateMessageDao
import com.blackat.chat.data.model.*

class PrivateMessageStore(
        private val store: PrivateMessageDao,
) {
    suspend fun save(message: Message, conversationId: Int) {
        store.insert(PrivateMessage(message,conversationId))
    }

    suspend fun getMessageWithE164List(): List<MessageWithE164> {
        return store.getMessagesWithState(MessageState.SENDING)
    }

    suspend fun markAsSent(id: Int) {
        return store.changeState(MessageState.SENT,id)
    }
}