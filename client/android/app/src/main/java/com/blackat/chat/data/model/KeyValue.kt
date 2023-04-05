package com.blackat.chat.data.model

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "key_value", indices = [
    Index(value = ["key"], unique = true)
])
data class KeyValue(
        val key: String,
        val value: String,
        ) {
    @PrimaryKey(autoGenerate = true)
    var id: Int? = null
}
