package com.blackat.chat.utils

import com.blackat.chat.data.model.FileInfo
import com.blackat.chat.data.model.Message
import com.blackat.chat.data.model.Partner
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
            writableMap.putBoolean("enablePinSecurity", privateConversation.enablePinSecurity)
            writableMap.putBoolean("allowNotification", privateConversation.allowNotification)
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
            writableMapMessage.putInt("senderDevice", privateMessage.message.senderDevice)
            writableMapMessage.putString("state",privateMessage.message.state.name)

            val writableMap = WritableNativeMap()
            writableMap.putInt("conversationId",privateMessage.privateConversationId)
            writableMap.putInt("id", privateMessage.id!!)
            writableMap.putMap("message", writableMapMessage)
            return  writableMap
        }

        fun getPrivateConversationWithMessages(privateConversationWithMessages: PrivateConversationWithMessages): WritableMap {
            val privateMessageArray = WritableNativeArray()

            val last = privateConversationWithMessages.messages.last()

            privateConversationWithMessages.messages.forEach() {
                privateMessageArray.pushMap(getPrivateMessage(it))
            }
            val writableMap = WritableNativeMap()
            writableMap.putArray("messages", privateMessageArray)
            writableMap.putString("state",last.message.state.name)
            writableMap.putMap("partner", getPartner(privateConversationWithMessages.partner))
            writableMap.putMap("conversation", getPrivateConversation(privateConversationWithMessages.conversation))
            return  writableMap
        }

        fun getAddress(address: SignalProtocolAddress): WritableMap {
            val writableMap = WritableNativeMap()
            writableMap.putString("e164", address.name)
            writableMap.putInt("deviceId", address.deviceId)
            return writableMap
        }

        fun getMessage(map: Message): WritableMap {
            val writableMap = Arguments.createMap()
            writableMap.putString("owner",map.owner)
            writableMap.putString("data",map.data)
            writableMap.putString("timestamp",map.timestamp)
            writableMap.putInt("type", map.type)
            return writableMap
        }

        fun getPartner(map: Partner): WritableMap {
            val writableMap = Arguments.createMap()
            writableMap.putInt("id",map.id!!)
            writableMap.putString("e164",map.e164)
            writableMap.putString("name",map.name)
            writableMap.putString("avatar", map.avatar)
            writableMap.putInt("deviceId", map.deviceId)
            writableMap.putString("nickname", map.nickname)
            return writableMap
        }

        fun getFileInfo(map: FileInfo): WritableMap {
            val writableMap = Arguments.createMap()
            writableMap.putString("name",map.fileName)
            writableMap.putString("type",map.fileType)
            writableMap.putInt("size",map.fileSize)
            return writableMap
        }
    }

}