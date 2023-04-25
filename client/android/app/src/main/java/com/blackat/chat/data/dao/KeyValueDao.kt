package com.blackat.chat.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.blackat.chat.data.model.*

@Dao
interface KeyValueDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(keyValue: KeyValue)

//    @Insert(onConflict = OnConflictStrategy.REPLACE)
//    suspend fun putString(keyValue: KeyValue)
//
//    @Insert(onConflict = OnConflictStrategy.REPLACE)
//    suspend fun putInt(keyValue: KeyValueInt)
//
//    @Insert(onConflict = OnConflictStrategy.REPLACE)
//    suspend fun putFloat(keyValue: KeyValueFloat)
//
//    @Insert(onConflict = OnConflictStrategy.REPLACE)
//    suspend fun putLong(keyValue: KeyValueLong)
//
//    @Insert(onConflict = OnConflictStrategy.REPLACE)
//    suspend fun putBool(keyValue: KeyValueBool)
//
//    @Insert(onConflict = OnConflictStrategy.REPLACE)
//    suspend fun putBlob(keyValue: KeyValueBlob)

    @Query("SELECT * FROM key_value WHERE key = :key")
    suspend fun get(key: String): KeyValue?

    @Query("DELETE FROM key_value WHERE key = :key")
    suspend fun delete(key: String)

}