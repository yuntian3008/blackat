package com.blackat.chat.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.blackat.chat.data.model.Address
import com.blackat.chat.data.model.Partner

@Dao
interface PartnerDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(partner: Partner): Long

    @Query("SELECT * FROM partner WHERE e164 = :e164")
    suspend fun getByE164(e164: String): Partner?

    @Update
    suspend fun update(partner: Partner)

    @Query("UPDATE partner SET " +
            "deviceId = :deviceId")
    suspend fun setDeviceId(deviceId: Int)

    @Query("SELECT EXISTS (SELECT * FROM partner WHERE e164 = :e164)")
    suspend fun contain(e164: String): Boolean

    @Query("SELECT id FROM partner WHERE e164 = :e164")
    suspend fun find(e164: String): Int?

    @Query("DELETE FROM partner")
    suspend fun deleteAll()
}