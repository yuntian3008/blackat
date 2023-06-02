package com.blackat.chat.data.dao

import androidx.room.Dao
import androidx.room.Embedded
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.blackat.chat.data.model.Message
import com.blackat.chat.data.model.MessageState
import com.blackat.chat.data.model.PrivateConversation
import com.blackat.chat.data.model.PrivateMessage

@Dao
interface PrivateMessageDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(privateMessage: PrivateMessage)

    @Query("DELETE FROM private_message")
    suspend fun deleteAll()

    @Query("DELETE FROM private_message WHERE privateConversationId = :privateConversationId")
    suspend fun delete(privateConversationId: Int)

    @Query("UPDATE private_message SET state = :messageState WHERE id = :id")
    suspend fun changeState(messageState: MessageState, id: Int)

    @Query("UPDATE private_message SET state = :messageState WHERE state = :oldMessageState AND privateConversationId = :conversationId")
    suspend fun changeStateFromState(messageState: MessageState, oldMessageState: MessageState, conversationId: Int)

    @Query(
            "SELECT private_message.*, private_conversation.e164 " +
                    "FROM private_conversation, private_message " +
                    "WHERE private_conversation.id = private_message.privateConversationId " +
                    "AND private_message.state = :messageState"
    )
    suspend fun getMessagesWithState(messageState: MessageState): List<MessageWithE164>

    @Query("DELETE FROM private_message")
    suspend fun clear()
}

data class MessageWithE164(
        @Embedded
        val message: Message,
        val id: Int,
        val e164: String,

)