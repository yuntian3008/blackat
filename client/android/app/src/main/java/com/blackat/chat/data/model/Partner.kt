package com.blackat.chat.data.model

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.fingerprint.NumericFingerprintGenerator


@Entity ("partner", indices = [
    Index(value = ["e164"], unique = true)
])
data class Partner(
        val e164: String,
        var deviceId: Int,
) {
    @PrimaryKey(autoGenerate = true)
    var id: Int? = null

    var name: String? = null
    var avatar: String? = null
    var nickname: String?= null
}
