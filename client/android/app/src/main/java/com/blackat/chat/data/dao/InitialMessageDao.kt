package com.blackat.chat.data.dao

import androidx.room.*
import com.blackat.chat.data.model.InitialMessage
import com.blackat.chat.data.model.Session
import com.blackat.chat.data.model.SignedPreKey

@Dao
interface InitialMessageDao {
    @Upsert()
    suspend fun upsert(initialMessage: InitialMessage)

    @Query("SELECT encrypted FROM initial_messages WHERE name = :name AND deviceId = :deviceId")
    suspend fun isEncrypted(name: String, deviceId: Int): Boolean?

    @Query("SELECT decrypted FROM initial_messages WHERE name = :name AND deviceId = :deviceId")
    suspend fun isDecrypted(name: String, deviceId: Int): Boolean?

    @Query("DELETE FROM initial_messages")
    suspend fun deleteAllTable()

    @Query("SELECT * FROM initial_messages WHERE name = :name AND deviceId = :deviceId")
    suspend fun get(name: String, deviceId: Int): InitialMessage?
}