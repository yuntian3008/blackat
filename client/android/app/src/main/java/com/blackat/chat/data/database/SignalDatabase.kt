package com.blackat.chat.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.blackat.chat.data.converter.Converters
import com.blackat.chat.data.dao.IdentityKeyDao
import com.blackat.chat.data.dao.KeyValueDao
import com.blackat.chat.data.dao.OneTimePreKeyDao
import com.blackat.chat.data.dao.SignedPreKeyDao
import com.blackat.chat.data.model.KeyValue

@Database(entities = [KeyValue::class], version = 1)
@TypeConverters(Converters::class)
abstract class SignalDatabase: RoomDatabase() {
    abstract fun keyValueDao(): KeyValueDao
    abstract fun identityDao(): IdentityKeyDao
    abstract fun oneTimePreKeyDao(): OneTimePreKeyDao
    abstract fun signedPreKeyDao(): SignedPreKeyDao

    companion object{
        @Volatile
        var instance: SignalDatabase ?=null
        private const val DATABASE_NAME="Signal"

        fun getInstance(context: Context):SignalDatabase
        {
            if(instance == null)
            {
                synchronized(SignalDatabase::class.java)
                {
                    if(instance == null)
                    {
                        instance = Room.databaseBuilder(context,SignalDatabase::class.java,
                                DATABASE_NAME)
                                .fallbackToDestructiveMigration()
                                .build()
                    }
                }
            }

            return instance!!
        }

    }
}