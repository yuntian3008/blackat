package com.blackatclient.module

import com.blackatclient.Utils
import com.blackatclient.data.database.AppDatabase
import com.blackatclient.data.database.entities.Test
import com.blackatclient.data.store.TestStore
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.signal.libsignal.protocol.IdentityKeyPair

class SignalModule internal constructor(context: ReactApplicationContext?) : ReactContextBaseJavaModule(context) {
    override fun getName(): String {
        return "SignalModule"
    }

    @ReactMethod
    fun generateIdentityKeyPair(promise: Promise) {
        val identityKeyPair = IdentityKeyPair.generate()
        promise.resolve(Utils.fromBytes(identityKeyPair.serialize()))
    }
}