package com.blackat.chat.utils

import com.blackat.chat.data.model.Address
import com.blackat.chat.data.model.Message
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import org.signal.libsignal.protocol.SignalProtocolAddress

class ReadableArrayUtils {
    companion object {
        fun getAddresses(map: ReadableArray): MutableList<SignalProtocolAddress> {
            val result = arrayListOf<SignalProtocolAddress>()
            for (i in 0 until map.size()) {
                result.add(ReadableMapUtils.getAddress(map.getMap(i)))
            }
            return result
        }
    }
}