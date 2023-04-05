package com.blackat.chat.signal

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import org.signal.libsignal.protocol.util.KeyHelper
import javax.annotation.Nullable

class RegistrationId {
    companion object {
        @SuppressLint("CommitPrefEdits")
        fun generate(context : ReactApplicationContext) : Int {
            val pref = context.getSharedPreferences("signal", ReactApplicationContext.MODE_PRIVATE)
            val isGenerated = pref.contains("registration_id")
            return if (!isGenerated) {
                val editor = pref.edit()
                val newRegistrationId = KeyHelper.generateRegistrationId(false)
                editor.putInt("registration_id", newRegistrationId).apply()
                newRegistrationId
            } else
                pref.getInt("registration_id",0)
        }

        fun isGenerated(context : ReactApplicationContext) : Boolean {
            val pref = context.getSharedPreferences("signal", ReactApplicationContext.MODE_PRIVATE)
            return pref.contains("registration_id")
        }

        fun get(context: ReactApplicationContext) : Int {
            return generate(context)
        }
    }
}