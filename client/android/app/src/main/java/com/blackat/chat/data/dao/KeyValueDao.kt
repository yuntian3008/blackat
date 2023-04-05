package com.blackat.chat.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.blackat.chat.data.model.KeyValue

@Dao
interface KeyValueDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(keyValue: KeyValue)

    @Query("SELECT value FROM key_value WHERE key = :key")
    suspend fun get(key: String): String
}