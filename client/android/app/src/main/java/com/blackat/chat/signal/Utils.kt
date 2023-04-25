package com.blackat.chat.signal

import android.util.Base64
import com.blackat.chat.data.model.Message
import com.facebook.react.bridge.ReadableMap

class Utils {
    companion object {
        fun bytesFromString(string: String): ByteArray = Base64.decode(string,Base64.DEFAULT)
        fun stringFromBytes(bytes: ByteArray): String = Base64.encodeToString(bytes,Base64.DEFAULT)
    }
}