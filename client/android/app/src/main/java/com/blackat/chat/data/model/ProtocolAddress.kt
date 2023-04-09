package com.blackat.chat.data.model

import androidx.room.PrimaryKey
import org.signal.libsignal.protocol.SignalProtocolAddress

data class ProtocolAddress(
        val name: String?,
        val deviceId: Int
        ) : SignalProtocolAddress(name, deviceId) {
    @PrimaryKey(autoGenerate = true)
    var id: Int? = null
}