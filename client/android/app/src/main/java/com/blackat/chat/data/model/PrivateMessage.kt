package com.blackat.chat.data.model

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

data class Message(
        val owner: String,
        val data: String,
        val type: Int,
        val timestamp: String,
) {
    companion object {
        const val TEXT_TYPE = 0
        const val IMAGE_TYPE = 1
        const val PARTNER = "PARTNER"
        const val SELF = "SELF"
    }
}

@Entity("private_message")
data class PrivateMessage(
    @Embedded
    val message: Message,
    val privateConversationId: Int
    ) {

    @PrimaryKey(autoGenerate = true)
    var id: Int? = null
}
