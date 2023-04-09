package com.blackat.chat.data.model

import org.signal.libsignal.protocol.ecc.ECKeyPair
import org.signal.libsignal.protocol.ecc.ECPrivateKey
import org.signal.libsignal.protocol.ecc.ECPublicKey

data class ECKeyPairModel(
        val privateKey: ECPrivateKey,
        val publicKey: ECPublicKey,
) : ECKeyPair(publicKey, privateKey)