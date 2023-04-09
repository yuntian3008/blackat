package com.blackat.chat.module

import android.util.Base64
import android.util.Log
import androidx.room.Room
import com.blackat.chat.data.database.SignalDatabase
import com.blackat.chat.data.repository.SignalRepository
import com.blackat.chat.signal.RegistrationId
import com.blackatclient.Utils
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.*
import org.signal.libsignal.protocol.IdentityKeyPair

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

                val response = withContext(context = Dispatchers.IO) {
                    return@withContext SignalRepository.onLogged(phoneNumber, deviceId)
                }

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