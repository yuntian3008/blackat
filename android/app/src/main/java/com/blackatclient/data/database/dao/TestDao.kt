package com.blackatclient.data.database.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import com.blackatclient.data.database.entities.Test

@Dao
interface TestDao {
    @Query("SELECT * FROM test")
    suspend fun getAll(): List<Test>

    @Query("SELECT * FROM test WHERE uid IN (:testIds)")
    suspend fun loadAllByIds(testIds: IntArray): List<Test>

    @Query("SELECT * FROM test WHERE col1 = :col1")
    suspend fun findByCol1(col1: String): Test

    @Insert
    suspend fun insertAll(vararg tests: Test)

    @Delete
    suspend fun delete(test: Test)
}