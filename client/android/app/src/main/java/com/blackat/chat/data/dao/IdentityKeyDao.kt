package com.blackat.chat.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.blackat.chat.data.model.Address
import com.blackat.chat.data.model.IdentityKey
import com.blackat.chat.data.model.KeyValue

@Dao
interface IdentityKeyDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(identityKey: IdentityKey)

    @Query("SELECT identityKey FROM identity_keys WHERE name = :name AND deviceId = :deviceId")
    suspend fun get(name: String, deviceId: Int): ByteArray?
}