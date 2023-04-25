package com.blackat.chat.module

import android.content.Context
import android.os.Build
import android.telephony.TelephonyManager
import android.util.Log
import androidx.annotation.RequiresApi
import com.blackat.chat.data.repository.AppRepository
import com.blackat.chat.data.repository.SignalRepository
import com.blackat.chat.signal.crypto.PreKeyUtil
import com.blackat.chat.utils.*
import com.blackat.chat.utils.Base64
import com.blackatclient.Utils
import com.facebook.react.bridge.*
import kotlinx.coroutines.*
import org.signal.libsignal.protocol.*
import org.signal.libsignal.protocol.ecc.Curve
import org.signal.libsignal.protocol.ecc.ECPublicKey
import org.signal.libsignal.protocol.message.CiphertextMessage
import org.signal.libsignal.protocol.message.PreKeySignalMessage
import org.signal.libsignal.protocol.message.SenderKeyMessage
import org.signal.libsignal.protocol.message.SignalMessage
import org.signal.libsignal.protocol.state.PreKeyBundle
import org.signal.libsignal.protocol.state.PreKeyRecord
import org.signal.libsignal.protocol.state.SignalProtocolStore
import org.signal.libsignal.protocol.state.SignedPreKeyRecord
import org.signal.libsignal.protocol.state.impl.InMemorySignalProtocolStore
import org.signal.libsignal.protocol.util.KeyHelper
import java.util.*


class SignalModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context), LifecycleEventListener {

    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
//    private val db = Room.databaseBuilder(context, SignalDatabase::class.java, "SignalDatabase").build()
//    private val keyValueDao = db.keyValueDao()
    init {
        context.addLifecycleEventListener(this)
    }
    override fun getName(): String {
        return "SignalModule"
    }

    override fun getConstants(): MutableMap<String, Any> {
        val constants = hashMapOf<String, Any>()
        constants["CURRENT_COUNTRY_CODE"] = getCurrentCountryCode().uppercase(Locale.getDefault())
        return constants
    }

    private val ALICE_ADDRESS = SignalProtocolAddress("+14151111111", 1)
    private val BOB_ADDRESS = SignalProtocolAddress("+14152222222", 1)

    @ReactMethod()
    fun testBasicPreKeyV3() {
        try {
            val aliceIdentityKeyPair = IdentityKeyPair.generate()
            val bobIdentityKeyPair = IdentityKeyPair.generate()
            val aliceRegistrationId = KeyHelper.generateRegistrationId(false)
            val bobRegistrationId = KeyHelper.generateRegistrationId(false)
            val aliceStore: SignalProtocolStore = InMemorySignalProtocolStore(aliceIdentityKeyPair,aliceRegistrationId)
            val aliceSessionBuilder = SessionBuilder(aliceStore, BOB_ADDRESS)
            val bobStore: SignalProtocolStore = InMemorySignalProtocolStore(bobIdentityKeyPair, bobRegistrationId)
            val bobPreKeyPair = Curve.generateKeyPair()
            val bobSignedPreKeyPair = Curve.generateKeyPair()
            val bobSignedPreKeySignature = Curve.calculateSignature(bobStore.identityKeyPair.privateKey,
                    bobSignedPreKeyPair.publicKey.serialize())
            val bobPreKey = PreKeyBundle(bobStore.localRegistrationId, 1,
                    31337, bobPreKeyPair.publicKey,
                    22, bobSignedPreKeyPair.publicKey,
                    bobSignedPreKeySignature,
                    bobStore.identityKeyPair.publicKey)
            aliceSessionBuilder.process(bobPreKey)
            assertTrue("Alice có session từ bob",aliceStore.containsSession(BOB_ADDRESS))
            assertTrue("Alice có session từ bob, sessionVersion = 3",aliceStore.loadSession(BOB_ADDRESS).sessionVersion == 3)
            val originalMessage = "Good, fast, cheap: pick two"

            val aliceSessionCipher = SessionCipher(aliceStore, BOB_ADDRESS)
            val outgoingMessage = aliceSessionCipher.encrypt(originalMessage.toByteArray())
            assertTrue("Alice tạo cipher có type là PREKEY",outgoingMessage.type == CiphertextMessage.PREKEY_TYPE)

            val outGoingMessageToDelivery = Base64.encodeBytes(outgoingMessage.serialize())

            val inGoingMessageToDelivery = Base64.decode(outGoingMessageToDelivery)

            val incomingMessage = PreKeySignalMessage(inGoingMessageToDelivery)
            bobStore.storePreKey(31337, PreKeyRecord(bobPreKey.preKeyId, bobPreKeyPair))
            bobStore.storeSignedPreKey(22, SignedPreKeyRecord(22, System.currentTimeMillis(), bobSignedPreKeyPair, bobSignedPreKeySignature))
            val bobSessionCipher = SessionCipher(bobStore, ALICE_ADDRESS)
            val plaintext = bobSessionCipher.decrypt(incomingMessage)
            assertTrue("Bob sau khi decrypt có session của Alice", bobStore.containsSession(ALICE_ADDRESS))
            assertTrue("Bob có session từ Alice, sessionVersion = 3",bobStore.loadSession(ALICE_ADDRESS).sessionVersion == 3)
            assertTrue("Bob có session từ Alice, aliceBaseKey != null",bobStore.loadSession(ALICE_ADDRESS).aliceBaseKey != null)
            assertTrue("Tin nhắn ban đầu khớp với tin nhắn đã decrypt",originalMessage == String(plaintext!!))
            val bobOutgoingMessage = bobSessionCipher.encrypt(originalMessage.toByteArray())
            assertTrue("Bob encrypt tin tiếp theo, cipher có type là WHIPSPER",bobOutgoingMessage.type == CiphertextMessage.WHISPER_TYPE)
            val bobOutGoingMessageToDelivery = Base64.encodeBytes(bobOutgoingMessage.serialize())

            val bobInGoingMessageToDelivery = Base64.decode(bobOutGoingMessageToDelivery)

            val alicePlaintext = aliceSessionCipher.decrypt(SignalMessage(bobInGoingMessageToDelivery))
            assertTrue("Tin nhắn tiếp theo khớp với tin nhắn tiếp theo đã decrypt",String(alicePlaintext) == originalMessage)
        } catch (e: Exception) {
            Log.e("testV3ERROR", e.toString())
        }

//        runInteraction(aliceStore, bobStore)
//        aliceStore = TestInMemorySignalProtocolStore()
//        aliceSessionBuilder = SessionBuilder(aliceStore, BOB_ADDRESS)
//        aliceSessionCipher = SessionCipher(aliceStore, BOB_ADDRESS)
//        bobPreKeyPair = Curve.generateKeyPair()
//        bobSignedPreKeyPair = Curve.generateKeyPair()
//        bobSignedPreKeySignature = Curve.calculateSignature(bobStore.identityKeyPair.privateKey, bobSignedPreKeyPair.publicKey.serialize())
//        bobPreKey = PreKeyBundle(bobStore.localRegistrationId,
//                1, 31338, bobPreKeyPair.publicKey,
//                23, bobSignedPreKeyPair.publicKey, bobSignedPreKeySignature,
//                bobStore.identityKeyPair.publicKey)
//        bobStore.storePreKey(31338, PreKeyRecord(bobPreKey.preKeyId, bobPreKeyPair))
//        bobStore.storeSignedPreKey(23, SignedPreKeyRecord(23, System.currentTimeMillis(), bobSignedPreKeyPair, bobSignedPreKeySignature))
//        aliceSessionBuilder.process(bobPreKey)
//        outgoingMessage = aliceSessionCipher.encrypt(originalMessage.toByteArray())
//        try {
//            plaintext = bobSessionCipher.decrypt(PreKeySignalMessage(outgoingMessage.serialize()))
//            throw AssertionError("shouldn't be trusted!")
//        } catch (uie: UntrustedIdentityException) {
//            bobStore.saveIdentity(ALICE_ADDRESS, PreKeySignalMessage(outgoingMessage.serialize()).identityKey)
//        }
//        plaintext = bobSessionCipher.decrypt(PreKeySignalMessage(outgoingMessage.serialize()))
//        assertTrue(String(plaintext) == originalMessage)
//        bobPreKey = PreKeyBundle(bobStore.localRegistrationId, 1,
//                31337, Curve.generateKeyPair().publicKey,
//                23, bobSignedPreKeyPair.publicKey, bobSignedPreKeySignature,
//                aliceStore.identityKeyPair.publicKey)
//        try {
//            aliceSessionBuilder.process(bobPreKey)
//            throw AssertionError("shoulnd't be trusted!")
//        } catch (uie: UntrustedIdentityException) {
//            // good
//        }
    }

    private fun assertTrue(title: String, condition: Boolean) {
        Log.d("testV3TEST","[${title}]: $condition")
    }


    @ReactMethod
    fun requireRegistrationId(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")


                    return@withContext SignalRepository.account().getRegistrationId()
                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }


    @ReactMethod
    fun requireIdentityKey(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")


                    val identityKey = SignalRepository.account().getIdentityKeyPair().publicKey


                    return@withContext Base64.encodeBytes(identityKey.serialize())
                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun requireOneTimePreKey(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val writableArray = WritableNativeArray()

                    val oneTimePreKeyList = PreKeyUtil.generateAndStoreOneTimePreKeys()
                    oneTimePreKeyList.forEach() {
                        val writableMap: WritableMap = WritableNativeMap()
                        val key = Base64.encodeBytes(it.keyPair.publicKey.serialize())
                        writableMap.putInt("id",it.id)
                        writableMap.putString("key",key)

                        writableArray.pushMap(writableMap)
                    }

                    return@withContext writableArray
                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun requireSignedPreKey(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val writableMap: WritableMap = WritableNativeMap()

                    val signedPreKey = PreKeyUtil.generateAndStoreSignedPreKey()

                    val key = Base64.encodeBytes(signedPreKey.keyPair.publicKey.serialize())
                    val signature = Base64.encodeBytes(signedPreKey.signature)
                    writableMap.putInt("id",signedPreKey.id)
                    writableMap.putString("key",key)
                    writableMap.putString("signature",signature)


                    return@withContext writableMap
                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun missingSession(addresses: ReadableArray, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val missing = arrayListOf<SignalProtocolAddress>()

                    val signalProtocolAddresses = ReadableArrayUtils.getAddresses(addresses)
                    signalProtocolAddresses.forEach() {
                        if (!SignalRepository.signalStore().containsSession(it))
                            missing.add(it)
                    }

                    return@withContext WritableArrayUtils.getAddresses(missing)

                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }


    @ReactMethod
    fun encrypt(address: ReadableMap, data: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val targetAddress = ReadableMapUtils.getAddress(address)
                    if (!SignalRepository.signalStore().containsSession(targetAddress))
                        throw Exception("cannot-found-session")

                    val sessionCipher = SessionCipher(SignalRepository.signalStore(),targetAddress)


                    val outGoingMessage = sessionCipher.encrypt(data.toByteArray())
                    Log.d("DebugV3", "Đã mã hóa tin nhắn [${targetAddress.name},${targetAddress.deviceId}] TYPE: ${outGoingMessage.type}")

                    val cipherMessage = CipherMessage(
                            outGoingMessage.type,
                            Base64.encodeBytes(outGoingMessage.serialize())
                    )

                    return@withContext WritableMapUtils.getCipherMessage(cipherMessage)
//                    if (outGoingMessage.type == SignalMessage.PREKEY_TYPE) {
//                        val preKeySignalMessage = PreKeySignalMessage(outGoingMessage.serialize())
//                        return@withContext Base64.encodeBytes(preKeySignalMessage.serialize())
//                    }
//                    else {
//                        val signalMessage = SignalMessage(outGoingMessage.serialize())
//                        return@withContext Base64.encodeBytes(signalMessage.serialize())
//                    }



                }
//                val targetAddress = ReadableMapUtils.getAddress(address)
//                Log.d("DebugV3", "Đã mã hóa tin nhắn [${targetAddress.name},${targetAddress.deviceId}]: $response")
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun clearAllTables(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    SignalRepository.clearAllTables()
                    AppRepository.clearAllTables()
                }

                promise.resolve(null)

            } catch (e: Exception) {
                promise.resolve(e)
                Log.e("clearAllTables",e.message ?: "")
            }
        }
    }

    @ReactMethod
    fun decrypt(address: ReadableMap, cipher: ReadableMap, promise: Promise) {
        scope.launch {
            try {
                val s = ReadableMapUtils.getAddress(address)
                Log.d("DebugV3", "Chuẩn bị giải mã tin nhắn [${s.name},${s.deviceId}]: $cipher")
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val cipherMessage = ReadableMapUtils.getCipherMessage(cipher)
                    val typeCipherMessage = cipherMessage.type
                    val dataCipherMessage = Base64.decode(cipherMessage.cipher)
                    val sender = ReadableMapUtils.getAddress(address)
                    val sessionCipher = SessionCipher(SignalRepository.signalStore(),sender)
                    Log.d("DebugV3", "Chuẩn bị giải mã tin nhắn [${sender.name},${sender.deviceId}] TYPE: $typeCipherMessage")
                    val plaintext: String = if (typeCipherMessage == SignalMessage.PREKEY_TYPE) {
                        AppRepository.privateConversation().getOneWithMessages(sender.name)?.let {
                            if (it.messages.size > 1)
                                throw Exception("wait-response")
                        }
                        val inComingMessage = PreKeySignalMessage(dataCipherMessage)
                        Log.d("DebugV3", "Giải mã tin nhắn [${sender.name},${sender.deviceId}] MESSAGEVERSION: ${inComingMessage.messageVersion}")
                        val plaintextContent = sessionCipher.decrypt(inComingMessage)
                        String(plaintextContent)

                    } else {
                        val inComingMessage = SignalMessage(dataCipherMessage)
                        Log.d("DebugV3", "Giải mã tin nhắn [${sender.name},${sender.deviceId}] MESSAGEVERSION: ${inComingMessage.messageVersion}")
                        val plaintextContent = sessionCipher.decrypt(inComingMessage)
                        String(plaintextContent)
                    }

                    return@withContext plaintext


                }

                promise.resolve(response)
            } catch (e: Exception) {
                Log.e("decrypt",e.message ?: "")
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun performKeyBundle(e164: String,bundle: ReadableMap, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val registrationId = bundle.getInt("registrationId")
                    val deviceId = bundle.getInt("deviceId")
                    val identityKeyBuffer = Base64.decode(bundle.getString("identityKey"))

                    val signedPreKeyMap = bundle.getMap("signedPreKey") ?: return@withContext false
                    val signedPreKeyId = signedPreKeyMap.getInt("id")
                    val signedPreKeyBuffer = Base64.decode(signedPreKeyMap.getString("key"))
                    val signedPreKeySignature = Base64.decode(signedPreKeyMap.getString("signature"))

                    val preKeyMap = bundle.getMap("preKey") ?: return@withContext false
                    val preKeyId = preKeyMap.getInt("id")
                    val preKeyBuffer = Base64.decode(preKeyMap.getString("key"))

                    val preKey = ECPublicKey(preKeyBuffer)
                    val signedPreKey = ECPublicKey(signedPreKeyBuffer)
                    val identityKey = IdentityKey(identityKeyBuffer)

                    val preKeyBundle = PreKeyBundle(
                            registrationId,
                            deviceId,
                            preKeyId,
                            preKey,
                            signedPreKeyId,
                            signedPreKey,
                            signedPreKeySignature,
                            identityKey
                    )

                    val targetAddress = SignalProtocolAddress(e164,deviceId)


                    val sessionBuilder = SessionBuilder(
                            SignalRepository.signalStore(),
                            targetAddress
                    )

                    try {


                        sessionBuilder.process(preKeyBundle)
                    } catch (ike: InvalidKeyException) {
                        return@withContext false
                    }
                    if (!SignalRepository.signalStore().containsSession(targetAddress))
                        return@withContext false

                    return@withContext true
                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun onFirstEverAppLaunch(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val pref = reactApplicationContext.getSharedPreferences("application",ReactApplicationContext.MODE_PRIVATE)
                    val isFirstLaunch = pref.getBoolean("first_launch", true)
                    if (isFirstLaunch) {
                        val result = SignalRepository.onFirstEverAppLaunch()
                        pref.edit().putBoolean("first_launch", false).apply()
                        return@withContext result
                    }

                  return@withContext true
                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.N)
    @ReactMethod
    fun checkIntegrityOfSignedPreKey(map: ReadableMap, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    var count = 0

                    map.entryIterator.forEach {
                        val bytes = Base64.decode(it.value.toString())
                        val oneTimePreKeyInDB = SignalRepository.signalPreKey().loadPreKey(it.key.toInt())
                        if (bytes.contentEquals(oneTimePreKeyInDB.serialize()))
                            count++
                    }


                    return@withContext count
                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

//    @RequiresApi(Build.VERSION_CODES.N)
//    @ReactMethod
//    fun verifySignedPreKey(publicKey: String, signedPreKey: String, promise: Promise) {
//        scope.launch {
//            try {
//                val response = withContext(context = Dispatchers.IO) {
//                    if (reactApplicationContext == null)
//                        throw Exception("context null")
//
//                    val pub = ECPublicKey(Base64.decode(publicKey))
//                    val preKey = SignedPreKeyRecord(Base64.decode(signedPreKey))
//                    PreKeyBundle()
//
//                    return@withContext pub.verifySignature()
//                }
//
//                promise.resolve(response)
//            } catch (e: Exception) {
//                promise.reject(e)
//            }
//        }
//    }

    @ReactMethod
    fun requireLocalAddress(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")
                    return@withContext WritableMapUtils.getAddress(SignalProtocolAddress(
                            SignalRepository.account().getE164()!!,
                            SignalRepository.account().getLocalDeviceId()!!
                    ))
                }

                promise.resolve(response)
            } catch (e: Exception) {
//                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun logged(phoneNumber: String, deviceId: Int) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")
                    SignalRepository.account().setLocalDeviceId(deviceId)
                    SignalRepository.account().setE164(phoneNumber)
                }

            } catch (e: Exception) {
//                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun logout() {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")
                    SignalRepository.account().resetLocalDeviceId()
                    SignalRepository.account().resetE164()
                }

            } catch (e: Exception) {
//                promise.reject(e)
            }
        }
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

    private fun getCurrentCountryCode(): String {
        val tm = reactApplicationContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        return tm.networkCountryIso
    }

    override fun onHostResume() {

    }

    override fun onHostPause() {

    }

    override fun onHostDestroy() {
        scope.cancel()
    }
}