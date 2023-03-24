package com.blackatclient.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.blackatclient.data.database.dao.TestDao
import com.blackatclient.data.database.entities.Test

@Database(entities = [Test::class], version = 0)
abstract class AppDatabase: RoomDatabase() {
    abstract fun testDao(): TestDao

    companion object {
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            if (INSTANCE == null) {
                INSTANCE = Room.databaseBuilder(
                        context.applicationContext,
                        AppDatabase::class.java, "task_database"
                ).build()
            }
            return INSTANCE!!
        }
    }
}