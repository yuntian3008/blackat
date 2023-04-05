package com.blackat.chat.data.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.blackat.chat.data.dao.KeyValueDao
import com.blackat.chat.data.model.KeyValue

@Database(entities = [KeyValue::class], version = 1)
abstract class SignalDatabase: RoomDatabase() {
    abstract fun keyValueDao(): KeyValueDao
}