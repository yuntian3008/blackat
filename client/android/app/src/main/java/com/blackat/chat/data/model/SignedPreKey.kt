package com.blackat.chat.data.model

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import org.signal.libsignal.protocol.ecc.Curve
import org.signal.libsignal.protocol.ecc.ECKeyPair
import org.signal.libsignal.protocol.ecc.ECPrivateKey
import org.signal.libsignal.protocol.ecc.ECPublicKey
import org.signal.libsignal.protocol.state.SignedPreKeyRecord
import java.security.PrivateKey

@Entity("signed_pre_key", indices = [
    Index(value = ["keyId"], unique = true)
])

data class SignedPreKey(
        val keyId: Int,
        val timestamp: Long,
        @Embedded
        val keyPair: ECKeyPairModel,
        val signature: ByteArray
) : SignedPreKeyRecord(keyId, timestamp, keyPair , signature) {
    @PrimaryKey(autoGenerate = true)
    var id: Int? = null
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as SignedPreKey

        if (keyId != other.keyId) return false
        if (timestamp != other.timestamp) return false
        if (keyPair != other.keyPair) return false
        if (!signature.contentEquals(other.signature)) return false
        if (id != other.id) return false

        return true
    }

    override fun hashCode(): Int {
        var result = keyId
        result = 31 * result + timestamp.hashCode()
        result = 31 * result + keyPair.hashCode()
        result = 31 * result + signature.contentHashCode()
        result = 31 * result + (id ?: 0)
        return result
    }
}