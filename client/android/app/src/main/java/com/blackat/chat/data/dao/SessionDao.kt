package com.blackat.chat.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.blackat.chat.data.model.Session
import com.blackat.chat.data.model.SignedPreKey

@Dao
interface SessionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(session: Session)

    @Query("SELECT * FROM sessions WHERE name = :name AND deviceId = :deviceId")
    suspend fun get(name: String, deviceId: Int): Session?

    @Query("SELECT deviceId FROM sessions WHERE name = :name AND deviceId != :deviceId")
    suspend fun getSubDevice(name: String, deviceId: Int): MutableList<Int>

    @Query("SELECT * FROM signed_pre_key")
    suspend fun getAll(): MutableList<SignedPreKey>

    @Query("SELECT EXISTS (SELECT * FROM sessions WHERE name = :name AND deviceId = :deviceId)")
    suspend fun contain(name: String, deviceId: Int): Boolean

    @Query("DELETE FROM sessions WHERE name = :name AND deviceId = :deviceId")
    suspend fun delete(name: String, deviceId: Int)

    @Query("DELETE FROM sessions WHERE name = :name")
    suspend fun deleteAll(name: String)
}