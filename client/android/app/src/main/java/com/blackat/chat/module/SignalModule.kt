package com.blackat.chat.module

import android.util.Base64
import android.util.Log
import androidx.room.Room
import com.blackat.chat.data.database.SignalDatabase
import com.blackat.chat.data.model.KeyValue
import com.blackat.chat.signal.RegistrationId
import com.blackatclient.Utils
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.*
import okio.ByteString.Companion.encode
import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.state.impl.InMemoryIdentityKeyStore
import org.signal.libsignal.protocol.util.ByteUtil
import org.signal.libsignal.protocol.util.KeyHelper
import java.nio.charset.Charset

class SignalModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(), LifecycleEventListener {
    init {
        context.addLifecycleEventListener(this)
    }
    override fun getName(): String {
        return "SignalModule"
    }





    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val db = Room.databaseBuilder(reactApplicationContext, SignalDatabase::class.java, "SignalDatabase").build()
    private val keyValueDao = db.keyValueDao()

    @ReactMethod
    fun generateRegistrationId(promise: Promise) {
        val registrationId = RegistrationId.generate(reactApplicationContext)
        promise.resolve(registrationId)
    }

//    @ReactMethod
//    fun generateIdentity(promise: Promise) {
//        val registrationId = RegistrationId.generate(reactApplicationContext)
//        promise.resolve(registrationId)
//    }

    @ReactMethod
    fun logged(phoneNumber: String, deviceId: Int, promise: Promise) {
        scope.launch {
            try {
                throw Exception("ahihi")
                val response = withContext(context = Dispatchers.IO) {
                    delay(2000)
                    return@withContext "ok"
                }
                delay(1000)
                cancel()
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun getIdentityKeyPair(promise: Promise) {
        val identityKeyPair = IdentityKeyPair.generate()
//        val signalProtocolAddress = SignalProtocolAddress(phoneNumber,deviceId)
        val a = identityKeyPair
        val fingerprint = a.publicKey.fingerprint
        Log.d("fingerprint1", fingerprint)

        val b = Base64.encodeToString(a.serialize(),Base64.DEFAULT)
        //Log.d("getIdentity", b)
//        val test =
        promise.resolve(b)
    }

    @ReactMethod
    fun setIdentityKeyPair(data: String) {
        val bytes = Base64.decode(data,Base64.DEFAULT)
//        val bytes = data.encodeToByteArray()
        val a = IdentityKeyPair(bytes)
        val fingerprint = a.publicKey.fingerprint
        Log.d("fingerprint2", fingerprint)

    }


//    @ReactMethod
//    fun checkSignalSetup(promise: Promise) {
//        val isGenerated = RegistrationId.isGenerated(reactApplicationContext)
//    }



    @ReactMethod
    fun generateIdentityKeyPair(promise: Promise) {
        val identityKeyPair = IdentityKeyPair.generate()
        promise.resolve(Utils.fromBytes(identityKeyPair.serialize()))
    }

    override fun onHostResume() {

    }

    override fun onHostPause() {

    }

    override fun onHostDestroy() {
        scope.cancel()
    }
}