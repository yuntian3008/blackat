package com.blackat.chat.data.dao

import androidx.room.*
import com.blackat.chat.data.model.Address
import com.blackat.chat.data.model.IdentityKey
import com.blackat.chat.data.model.KeyValue

@Dao
interface IdentityKeyDao {
    @Upsert
    suspend fun put(identityKey: IdentityKey)

    @Query("SELECT identityKey FROM identity_keys WHERE name = :name AND deviceId = :deviceId")
    suspend fun get(name: String, deviceId: Int): ByteArray?

    @Query("DELETE FROM identity_keys")
    suspend fun deleteAll()

    @Query("DELETE FROM identity_keys")
    suspend fun clear()
}