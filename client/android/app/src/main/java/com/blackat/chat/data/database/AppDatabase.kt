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
    PrivateConversation::class,
    PrivateMessage::class,
    Partner::class
], version = 100)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun privateConversationDao(): PrivateConversationDao
    abstract fun privateMessageDao(): PrivateMessageDao
    abstract fun partnerDao(): PartnerDao

    companion object {
        @Volatile
        var instance: AppDatabase? = null
        private const val DATABASE_NAME = "App"

        fun getInstance(context: Context): AppDatabase {
            if (instance == null) {
                synchronized(AppDatabase::class.java)
                {
                    if (instance == null) {
//                        context.applicationContext.deleteDatabase(DATABASE_NAME);
                        instance = Room.databaseBuilder(context, AppDatabase::class.java,
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