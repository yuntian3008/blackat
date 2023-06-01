package com.blackat.chat.utils

import com.blackat.chat.data.model.Address
import com.blackat.chat.data.model.FileInfo
import com.blackat.chat.data.model.Message
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import org.signal.libsignal.protocol.SignalProtocolAddress

class ReadableMapUtils {
    companion object {

        fun getCipherMessage(map: ReadableMap): CipherMessage = CipherMessage(map.getInt("type"),map.getString("cipher")!!)

        fun getMessage(map: ReadableMap): Message {
            return Message(
                    map.getString("owner")!!,
                    map.getString("data")!!,
                    map.getInt("type"),
                    map.getString("timestamp")!!,
                    map.getInt("senderDevice"),
            )
        }

        fun getFileInfo(map: ReadableMap): FileInfo {
            return FileInfo(
                    map.getString("name")!!,
                    map.getString("type")!!,
                    map.getInt("size"),
            )
        }

        fun getAddress(map: ReadableMap): SignalProtocolAddress {
                return SignalProtocolAddress(
                        map.getString("e164"),
                        map.getInt("deviceId")
                )
        }
    }
}