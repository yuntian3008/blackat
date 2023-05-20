package com.blackat.chat.data.model

import androidx.room.*

@Entity("private_conversation", indices = [
    Index(value = ["e164"], unique = true)
])
data class PrivateConversation(
        val e164: String,
        val partnerId: Int,
) {
    @PrimaryKey(autoGenerate = true)
    var id: Int? = null
    @ColumnInfo(defaultValue = "0")
    var ting: Int? = 0
}

data class PrivateConversationWithMessages(
        @Embedded val conversation: PrivateConversation,
        @Relation(
                parentColumn = "id",
                entityColumn = "privateConversationId"
        )
        val messages: List<PrivateMessage>
)
