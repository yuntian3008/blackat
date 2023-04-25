package com.blackat.chat.utils

import com.blackat.chat.data.model.PrivateConversation
import com.blackat.chat.data.model.PrivateConversationWithMessages
import com.blackat.chat.data.model.PrivateMessage
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import org.signal.libsignal.protocol.SignalProtocolAddress

class WritableArrayUtils {
    companion object {
        fun getAddresses(addresses: MutableList<SignalProtocolAddress>): WritableArray {
            val writableArray: WritableArray = WritableNativeArray()

            addresses.forEach() {
                val writableMap = WritableNativeMap()
                writableMap.putString("e164", it.name)
                writableMap.putInt("deviceId",it.deviceId)
                writableArray.pushMap(writableMap)
            }

            return writableArray
        }

        fun getPrivateConversationsWithMessages(privateConversationWithMessagesList: List<PrivateConversationWithMessages>): WritableArray {
            val writableArray: WritableArray = Arguments.createArray()

            privateConversationWithMessagesList.forEach() {
                writableArray.pushMap(WritableMapUtils.getPrivateConversationWithMessages(it))
            }

            return writableArray
        }
    }

}