package com.blackat.chat.data.model

import androidx.room.*
import org.signal.libsignal.protocol.SignalProtocolAddress

class Address(
        val name: String,
        val deviceId: Int,
) {
        @Ignore
        constructor(address: SignalProtocolAddress) : this(address.name,address.deviceId)

        fun getSignalProtocolAddress(): SignalProtocolAddress = SignalProtocolAddress(name,deviceId)
}

@Entity(tableName = "identity_keys")
data class IdentityKey(
        @PrimaryKey
        @Embedded val address: Address,
        val identityKey: ByteArray,
) {
        override fun equals(other: Any?): Boolean {
                if (this === other) return true
                if (javaClass != other?.javaClass) return false

                other as IdentityKey

                if (address != other.address) return false
                if (!identityKey.contentEquals(other.identityKey)) return false

                return true
        }

        override fun hashCode(): Int {
                var result = address.hashCode()
                result = 31 * result + identityKey.contentHashCode()
                return result
        }
}