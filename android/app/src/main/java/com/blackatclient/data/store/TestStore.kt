package com.blackatclient.data.store

import com.blackatclient.data.database.dao.TestDao
import com.blackatclient.data.database.entities.Test

class TestStore(
        private val testDao: TestDao
) {
    suspend fun insertAll(vararg tests: Test) {
        testDao.insertAll(*tests)
    }
}