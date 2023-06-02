package com.blackat.chat.signal.storage

import com.blackat.chat.data.dao.MessageWithE164
import com.blackat.chat.data.dao.PrivateMessageDao
import com.blackat.chat.data.model.*
import kotlinx.coroutines.runBlocking

class PrivateMessageStore(
        private val store: PrivateMessageDao,
) {
    suspend fun save(message: Message, conversationId: Int) {
        store.insert(PrivateMessage(message,conversationId))
    }

    suspend fun remove(conversationId: Int) {
        store.delete(conversationId)
    }

    suspend fun getMessageWithE164List(): List<MessageWithE164> {
        return store.getMessagesWithState(MessageState.SENDING)
    }

    suspend fun markAllPartnerMessageAsRead(conversationId: Int) {
        return store.changeStateFromState(MessageState.READ,MessageState.UNREAD, conversationId)
    }

    suspend fun markAllPartnerMessageAsUnread(conversationId: Int) {
        return store.changeStateFromState(MessageState.UNREAD,MessageState.READ, conversationId)
    }

    suspend fun markAsSent(id: Int) {
        return store.changeState(MessageState.SENT,id)
    }

    suspend fun markAsError(id: Int) {
        return store.changeState(MessageState.ERROR,id)
    }

    suspend fun clear() = store.clear()
}