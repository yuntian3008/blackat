package com.blackat.chat.utils

import com.blackat.chat.data.model.PrivateConversation
import com.blackat.chat.data.model.PrivateConversationWithMessages
import com.blackat.chat.data.model.PrivateMessage
import com.facebook.react.bridge.*
import org.signal.libsignal.protocol.SignalProtocolAddress

data class CipherMessage(
        public val type: Int,
        public val cipher: String
)

class WritableMapUtils {
    companion object {
        fun getPrivateConversation(privateConversation: PrivateConversation): WritableMap {
            val writableMap = WritableNativeMap()
            writableMap.putInt("id",privateConversation.id!!)
            writableMap.putString("e164", privateConversation.e164)
            return  writableMap
        }

        fun getCipherMessage(cipherMessage: CipherMessage): WritableMap {
            val map = Arguments.createMap()
            map.putInt("type",cipherMessage.type)
            map.putString("cipher",cipherMessage.cipher)

            return map
        }

        fun getPrivateMessage(privateMessage: PrivateMessage): WritableMap {
            val writableMapMessage = WritableNativeMap()
            writableMapMessage.putString("owner",privateMessage.message.owner)
            writableMapMessage.putString("data", privateMessage.message.data)
            writableMapMessage.putInt("type",privateMessage.message.type)
            writableMapMessage.putString("timestamp", privateMessage.message.timestamp)

            val writableMap = WritableNativeMap()
            writableMap.putInt("conversationId",privateMessage.privateConversationId)
            writableMap.putInt("id", privateMessage.id!!)
            writableMap.putMap("message", writableMapMessage)
            return  writableMap
        }

        fun getPrivateConversationWithMessages(privateConversationWithMessages: PrivateConversationWithMessages): WritableMap {
            val privateMessageArray = WritableNativeArray()

            privateConversationWithMessages.messages.forEach() {
                privateMessageArray.pushMap(getPrivateMessage(it))
            }
            val writableMap = WritableNativeMap()
            writableMap.putArray("messages", privateMessageArray)
            writableMap.putMap("conversation", getPrivateConversation(privateConversationWithMessages.conversation))
            return  writableMap
        }

        fun getAddress(address: SignalProtocolAddress): WritableMap {
            val writableMap = WritableNativeMap()
            writableMap.putString("e164", address.name)
            writableMap.putInt("deviceId", address.deviceId)
            return writableMap
        }
    }

}