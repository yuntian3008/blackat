package com.blackat.chat.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.blackat.chat.data.model.SignedPreKey

@Dao
interface SignedPreKeyDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(signedPreKey: SignedPreKey )

    @Query("SELECT * FROM signed_pre_key WHERE keyId = :keyId")
    suspend fun get(keyId: Int): SignedPreKey

    @Query("SELECT * FROM signed_pre_key")
    suspend fun getAll(): MutableList<SignedPreKey>

    @Query("SELECT EXISTS (SELECT * FROM signed_pre_key WHERE keyId = :keyId)")
    suspend fun contain(keyId: Int): Boolean

    @Query("DELETE FROM signed_pre_key WHERE keyId = :keyId")
    suspend fun delete(keyId: Int)

    @Query("DELETE FROM signed_pre_key")
    suspend fun clear()
}