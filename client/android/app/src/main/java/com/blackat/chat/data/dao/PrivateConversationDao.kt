package com.blackat.chat.data.dao

import androidx.room.*
import com.blackat.chat.data.model.PrivateConversation
import com.blackat.chat.data.model.PrivateConversationWithMessages
import com.blackat.chat.data.model.Session
import kotlinx.coroutines.flow.Flow

@Dao
interface PrivateConversationDao {
    @Transaction
    @Query("SELECT * FROM private_conversation")
    fun getAllWithMessages(): Flow<List<PrivateConversationWithMessages>>

    @Transaction
    @Query("SELECT * FROM private_conversation, private_message " +
            "WHERE private_conversation.id = private_message.privateConversationId")
    fun getSendingStateWithMessages(): Flow<List<PrivateConversationWithMessages>>

    @Query("SELECT * FROM private_conversation")
    suspend fun getAll(): List<PrivateConversation>

    @Transaction
    @Query("SELECT * FROM private_conversation WHERE e164 = :e164")
    suspend fun getOneWithMessages(e164: String): PrivateConversationWithMessages?

    @Query("SELECT * FROM private_conversation WHERE e164 = :e164")
    suspend fun get(e164: String): PrivateConversation?

    @Query("UPDATE private_conversation SET ting = ting + 1 WHERE e164 = :e164")
    suspend fun ting(e164: String)

    @Query("UPDATE private_conversation SET allowNotification = :state WHERE e164 = :e164")
    suspend fun setAllowNotification(e164: String, state: Boolean)

    @Query("UPDATE private_conversation SET enablePinSecurity = :state WHERE e164 = :e164")
    suspend fun setEnablePinSecurity(e164: String, state: Boolean)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(privateConversation: PrivateConversation): Long

    @Query("SELECT EXISTS (SELECT * FROM private_conversation WHERE e164 = :e164)")
    suspend fun contain(e164: String): Boolean

    @Query("SELECT * FROM private_conversation")
    fun getAllFlow(): Flow<List<PrivateConversation>>

    @Query("DELETE FROM private_conversation")
    suspend fun deleteAll()

    @Query("DELETE FROM private_conversation")
    suspend fun clear()

    @Query("DELETE FROM private_conversation WHERE e164 = :e164")
    suspend fun delete(e164: String)


}