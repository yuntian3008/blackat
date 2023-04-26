package com.blackat.chat.data.model

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "initial_messages")
data class InitialMessage(
        @PrimaryKey
        @Embedded
        val address: Address,
) {
    var encrypted: Boolean = false
    var decrypted: Boolean = false
}
