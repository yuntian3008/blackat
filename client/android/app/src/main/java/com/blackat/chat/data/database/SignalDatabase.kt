package com.blackat.chat.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.blackat.chat.data.converter.Converters
import com.blackat.chat.data.dao.*
import com.blackat.chat.data.model.*

@Database(entities = [
    KeyValue::class,
    IdentityKey::class,
    OneTimePreKey::class,
    SignedPreKey::class,
    Session::class
], version = 100)
@TypeConverters(Converters::class)
abstract class SignalDatabase : RoomDatabase() {
    abstract fun keyValueDao(): KeyValueDao
    abstract fun identityDao(): IdentityKeyDao
    abstract fun oneTimePreKeyDao(): OneTimePreKeyDao
    abstract fun signedPreKeyDao(): SignedPreKeyDao
    abstract fun sessionDao(): SessionDao

    companion object {
        @Volatile
        var instance: SignalDatabase? = null
        private const val DATABASE_NAME = "Signal"

        fun getInstance(context: Context): SignalDatabase {
            if (instance == null) {
                synchronized(SignalDatabase::class.java)
                {
                    if (instance == null) {
//                        context.applicationContext.deleteDatabase(SignalDatabase.DATABASE_NAME);
                        instance = Room.databaseBuilder(context, SignalDatabase::class.java,
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