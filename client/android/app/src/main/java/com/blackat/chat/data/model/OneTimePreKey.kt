package com.blackat.chat.data.model

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import org.signal.libsignal.protocol.ecc.ECKeyPair
import org.signal.libsignal.protocol.ecc.ECPrivateKey
import org.signal.libsignal.protocol.ecc.ECPublicKey
import org.signal.libsignal.protocol.state.PreKeyRecord
import org.signal.libsignal.protocol.state.SignedPreKeyRecord

@Entity("one_time_pre_key", indices = [
    Index(value = ["keyId"], unique = true)
])
data class OneTimePreKey(
        val keyId: Int,
        @Embedded
        val ecKeyPair: ECKeyPairModel
) : PreKeyRecord(keyId, ecKeyPair ) {
    @PrimaryKey(autoGenerate = true)
    var id: Int? = null
}