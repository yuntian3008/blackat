package com.blackat.chat.signal

import com.facebook.react.bridge.ReactApplicationContext
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.state.impl.InMemoryIdentityKeyStore
import org.signal.libsignal.protocol.util.KeyHelper

class AddressProtocol {
    companion object {
        fun generate(context : ReactApplicationContext, phoneNumber: String, deviceId: Int) : Int {
            val pref = context.getSharedPreferences("signal", ReactApplicationContext.MODE_PRIVATE)
            val isGenerated = pref.contains("registration_id")
            val address = SignalProtocolAddress(phoneNumber,deviceId)
//            val a = InMemoryIdentityKeyStore()
            return if (!isGenerated) {
                val editor = pref.edit()
                val newRegistrationId = KeyHelper.generateRegistrationId(false)
                editor.putInt("registration_id", newRegistrationId).apply()
                newRegistrationId
            } else
                pref.getInt("registration_id",0)
        }
    }
}