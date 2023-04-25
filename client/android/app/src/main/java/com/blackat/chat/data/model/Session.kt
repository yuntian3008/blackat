package com.blackat.chat.data.model

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.PrimaryKey
import org.signal.libsignal.protocol.state.SessionRecord

@Entity(tableName = "sessions")
data class Session(
        @PrimaryKey
        @Embedded
        val address: Address,
        val record: SessionRecord
)
