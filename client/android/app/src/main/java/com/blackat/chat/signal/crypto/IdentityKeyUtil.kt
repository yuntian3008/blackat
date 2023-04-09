package com.blackat.chat.signal.crypto

import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.ecc.Curve

class IdentityKeyUtil {
    companion object {
        fun generateIdentityKeyPair(): IdentityKeyPair {
            val keyPair = Curve.generateKeyPair()
            val identityKey = IdentityKey(keyPair.publicKey)
            val privateKey = keyPair.privateKey
            return IdentityKeyPair(identityKey,privateKey)
        }
    }
}