package com.blackat.chat.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.blackat.chat.data.model.PrivateConversation
import com.blackat.chat.data.model.PrivateMessage

@Dao
interface PrivateMessageDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(privateMessage: PrivateMessage)

    @Query("DELETE FROM private_message")
    suspend fun deleteAll()
}