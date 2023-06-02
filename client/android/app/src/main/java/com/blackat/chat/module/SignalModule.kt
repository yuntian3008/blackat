package com.blackat.chat.module

import android.app.Application
import android.content.ContentValues
import android.content.Context
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.telephony.TelephonyManager
import android.util.Log
import androidx.annotation.RequiresApi
import com.blackat.chat.data.database.AppDatabase
import com.blackat.chat.data.database.SignalDatabase
import com.blackat.chat.data.repository.AppRepository
import com.blackat.chat.data.repository.SignalRepository
import com.blackat.chat.signal.crypto.PreKeyUtil
import com.blackat.chat.test.Test
import com.blackat.chat.utils.*
import com.blackat.chat.utils.Base64
import com.facebook.react.bridge.*
import com.th3rdwave.safeareacontext.getFrame
import kotlinx.coroutines.*
import org.signal.libsignal.protocol.*
import org.signal.libsignal.protocol.ecc.Curve
import org.signal.libsignal.protocol.ecc.ECPublicKey
import org.signal.libsignal.protocol.fingerprint.Fingerprint
import org.signal.libsignal.protocol.fingerprint.NumericFingerprintGenerator
import org.signal.libsignal.protocol.message.PreKeySignalMessage
import org.signal.libsignal.protocol.message.SignalMessage
import org.signal.libsignal.protocol.state.PreKeyBundle
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.util.*


class SignalModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context), LifecycleEventListener {

    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

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
                        writableMap.putInt("id", it.id)
                        writableMap.putString("key", key)

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
                    writableMap.putInt("id", signedPreKey.id)
                    writableMap.putString("key", key)
                    writableMap.putString("signature", signature)


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

    private suspend fun encrypt(address: ReadableMap, data: ByteArray): WritableMap {
        val targetAddress = ReadableMapUtils.getAddress(address)
        if (!SignalRepository.signalStore().containsSession(targetAddress))
            throw Exception("cannot-found-session ${targetAddress.name}, ${targetAddress.deviceId}")

        val sessionCipher = SessionCipher(SignalRepository.signalStore(), targetAddress)


        val outGoingMessage = sessionCipher.encrypt(data)
        Log.d("DebugV3", "Đã mã hóa tin nhắn [${targetAddress.name},${targetAddress.deviceId}] TYPE: ${outGoingMessage.type}")

        val cipherMessage = CipherMessage(
                outGoingMessage.type,
                Base64.encodeBytes(outGoingMessage.serialize())
        )

        return WritableMapUtils.getCipherMessage(cipherMessage)
    }

    @ReactMethod
    fun encryptFile(address: ReadableMap, uri: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val filePath = uri.replace("file://", "")

                    val file = File(filePath)
                    val inputStream = FileInputStream(file)
                    val outputStream = ByteArrayOutputStream()
                    val buffer = ByteArray(1024)

                    var length: Int
                    while (inputStream.read(buffer).also { length = it } != -1) {
                        outputStream.write(buffer, 0, length)
                    }

                    val byteArray = outputStream.toByteArray()

                    val startTime = System.currentTimeMillis()

                    val encrypted = encrypt(address, byteArray)

                    val endTime = System.currentTimeMillis()
                    val elapsedTime = endTime - startTime
                    Log.d("DebugV6","THỜI GIAN MÃ HÓA: $elapsedTime milliseconds")
                    return@withContext encrypted

                }
                val cipherMessage = ReadableMapUtils.getCipherMessage(response)
                Log.d("DebugV5", "MÃ HÓA THÀNH CÔNG FILE [${uri}] => [${cipherMessage.cipher}]")
                promise.resolve(response)
            } catch (e: Exception) {
                Log.d("SignalError", e.stackTraceToString())
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

                    val startTime = System.currentTimeMillis()

                    val encrypted = encrypt(address, data.toByteArray())

                    val endTime = System.currentTimeMillis()
                    val elapsedTime = endTime - startTime
                    Log.d("DebugV6","THỜI GIAN MÃ HÓA: $elapsedTime milliseconds")
                    return@withContext encrypted

                }
                val cipherMessage = ReadableMapUtils.getCipherMessage(response)
                Log.d("DebugV5", "MÃ HÓA THÀNH CÔNG [${data}] => [${cipherMessage.cipher}]")
                promise.resolve(response)
            } catch (e: Exception) {
                Log.d("SignalError", e.stackTraceToString())
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
                Log.e("clearAllTables", e.message ?: "")
            }
        }
    }

//    @ReactMethod
//    fun decrypt(address: ReadableMap, cipher: ReadableMap, forcePreKey: Boolean, promise: Promise) {
//        scope.launch {
//            try {
//                val s = ReadableMapUtils.getAddress(address)
//                Log.d("DebugV3", "Chuẩn bị giải mã tin nhắn [${s.name},${s.deviceId}]: $cipher")
//                val response = withContext(context = Dispatchers.IO) {
//                    if (reactApplicationContext == null)
//                        throw Exception("context null")
//
//                    val cipherMessage = ReadableMapUtils.getCipherMessage(cipher)
//                    val typeCipherMessage = cipherMessage.type
//                    val dataCipherMessage = Base64.decode(cipherMessage.cipher)
//                    val sender = ReadableMapUtils.getAddress(address)
//                    val sessionCipher = SessionCipher(SignalRepository.signalStore(), sender)
//                    Log.d("DebugV3", "Chuẩn bị giải mã tin nhắn [${sender.name},${sender.deviceId}] TYPE: $typeCipherMessage")
//                    val plaintext: String = if (typeCipherMessage == SignalMessage.PREKEY_TYPE) {
//                        if (!forcePreKey)
//                            AppRepository.privateConversation().getOneWithMessages(sender.name)?.let {
//                                if (it.messages.isNotEmpty()) {
//                                    val error = Arguments.createMap()
//                                    error.putString("code", "need-encrypt")
//                                    return@withContext error
//                                }
//
//                            }
//                        val inComingMessage = PreKeySignalMessage(dataCipherMessage)
//                        Log.d("DebugV3", "Giải mã tin nhắn [${sender.name},${sender.deviceId}] MESSAGEVERSION: ${inComingMessage.messageVersion}")
//                        val plaintextContent = sessionCipher.decrypt(inComingMessage)
//                        String(plaintextContent)
//
//                    } else {
//                        val inComingMessage = SignalMessage(dataCipherMessage)
//                        Log.d("DebugV3", "Giải mã tin nhắn [${sender.name},${sender.deviceId}] MESSAGEVERSION: ${inComingMessage.messageVersion}")
//                        val plaintextContent = sessionCipher.decrypt(inComingMessage)
//                        String(plaintextContent)
//                    }
//
//                    return@withContext plaintext
//
//
//                }
//
//                promise.resolve(response)
//            } catch (e: Exception) {
//                Log.e("DebugV3", e.message ?: "")
//                val error = Arguments.createMap()
//                error.putString("code", "need-encrypt")
//                promise.resolve(error)
//            }
//        }
//    }

    private suspend fun decrypt(address: ReadableMap, cipher: ReadableMap, forcePreKey: Boolean): Any {
        val cipherMessage = ReadableMapUtils.getCipherMessage(cipher)
        val typeCipherMessage = cipherMessage.type
        val dataCipherMessage = Base64.decode(cipherMessage.cipher)
        val sender = ReadableMapUtils.getAddress(address)
        val sessionCipher = SessionCipher(SignalRepository.signalStore(), sender)
        Log.d("DebugV3", "Chuẩn bị giải mã tin nhắn [${sender.name},${sender.deviceId}] TYPE: $typeCipherMessage")

        try {
            val plaintextByteArray: ByteArray = if (typeCipherMessage == SignalMessage.PREKEY_TYPE) {
                if (!forcePreKey)
                    AppRepository.privateConversation().getOneWithMessages(sender.name)?.let {
                        val messageByDevice = it.messages.filter { it2 -> it2.message.senderDevice == sender.deviceId }
                        if (messageByDevice.isNotEmpty()) {
                            val error = Arguments.createMap()
                            error.putString("code", "need-encrypt")
                            return error
                        }

                    }
                val inComingMessage = PreKeySignalMessage(dataCipherMessage)
                Log.d("DebugV3", "Giải mã tin nhắn [${sender.name},${sender.deviceId}] MESSAGEVERSION: ${inComingMessage.messageVersion}")
                sessionCipher.decrypt(inComingMessage)
            } else {
                val inComingMessage = SignalMessage(dataCipherMessage)
                Log.d("DebugV3", "Giải mã tin nhắn [${sender.name},${sender.deviceId}] MESSAGEVERSION: ${inComingMessage.messageVersion}")
                sessionCipher.decrypt(inComingMessage)
            }


            AppRepository.partner().upsert(sender.name, sender.deviceId)

            return plaintextByteArray
        } catch (e: Exception) {
            val error = Arguments.createMap()
            when (e) {
                is DuplicateMessageException -> {
                    error.putString("code", "duplicate")
                }
                else -> {
                    error.putString("code", "need-encrypt")
                }
            }
            error.putString("stack",e.stackTraceToString())
            Log.e("DebugV4", e.stackTraceToString())

            return error
        }
    }

    @ReactMethod
    fun decrypt(address: ReadableMap, cipher: ReadableMap, forcePreKey: Boolean, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val startTime = System.currentTimeMillis()

                    val result = decrypt(address,cipher,forcePreKey)
                    val endTime = System.currentTimeMillis()
                    val elapsedTime = endTime - startTime
                    Log.d("DebugV6","THỜI GIAN GIẢI MÃ: $elapsedTime milliseconds")
                    if (result is ByteArray) {
                        val plaintext = String(result)
                        val cipherMessage = ReadableMapUtils.getCipherMessage(cipher)
                        Log.d("DebugV5", "GIẢI MÃ THÀNH CÔNG [${cipherMessage.cipher}] => [${plaintext}]")
                        return@withContext plaintext
                    }

                    return@withContext result

                }

                promise.resolve(response)
            } catch (e: Exception) {
                Log.e("DebugV3", e.message ?: "")
            }
        }
    }

    private fun writeFile(byteArray: ByteArray, fileName: String, fileType: String): String? {
        try {
            var result: String = ""
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val resolver = reactApplicationContext.contentResolver

                val contentValues = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, fileName)
                    put(MediaStore.Downloads.MIME_TYPE, fileType)
                    put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Blackat")
                }

                val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)

                val outputStream = uri?.let {
                    resolver.openOutputStream(it)
                }

                outputStream?.use {
                    it.write(byteArray)
                }

                val fileDone = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),"Blackat/${fileName}")


                result = fileDone.absolutePath

            } else {
                val fileDir = File(reactApplicationContext.getExternalFilesDir(null), "Blackat")
                fileDir.mkdirs()

                var fileIndex = 0
                val maxIndex = 1000

                var fileOldVersion = File(fileDir, fileName)
                while (fileOldVersion.exists() && fileIndex < maxIndex) {
                    fileIndex++
                    fileOldVersion = File(fileDir, fileName.replace(".","$fileIndex."))
                }

                if (fileIndex == maxIndex) {
                    throw Exception("Cannot save file: maximum number of index attempts reached")
                }

                fileOldVersion.writeBytes(byteArray)


                result = fileOldVersion.path
            }
            return "file://$result"
        } catch (e: Exception) {
            Log.e("writeFile",e.message,e)
            return null
        }

    }

    @ReactMethod
    fun decryptFile(address: ReadableMap, cipher: ReadableMap, fileInfo: ReadableMap, forcePreKey: Boolean, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    Log.d("DebugV3", "Chuẩn bị giải mã file")
                    val cipherMessage = ReadableMapUtils.getCipherMessage(cipher)
                    val startTime = System.currentTimeMillis()

                    val result = decrypt(address,cipher,forcePreKey)
                    val endTime = System.currentTimeMillis()
                    val elapsedTime = endTime - startTime
                    Log.d("DebugV6","THỜI GIAN GIẢI MÃ: $elapsedTime milliseconds")
                    if (result is ByteArray) {
                        val file = ReadableMapUtils.getFileInfo(fileInfo)
                        Log.d("DebugV3", "Chuẩn bị ghi file")
                        Log.d("DebugV5", "GIẢI MÃ THÀNH CÔNG FILE [${cipherMessage.cipher}] => [SIZE=${file.fileSize}]")
                        return@withContext writeFile(result,file.fileName, file.fileType)
                    }

                    return@withContext result

                }

                promise.resolve(response)
            } catch (e: Exception) {
                Log.e("DebugV3", e.message ?: "")
            }
        }
    }

    private suspend fun getFingerprint(e164: String): Fingerprint? {
        val partner = AppRepository.partner().getByE164(e164)
        val result = partner?.let {
            if (partner.deviceId == 0) return null
            val localStableId = SignalRepository.account().getE164()!!.toByteArray()
            val remoteStableId = partner.e164.toByteArray()
            val localIdentityKey = SignalRepository.signalStore().identityKeyPair.publicKey
            val remoteIdentityKey = SignalRepository.signalIdentityKey().getIdentity(
                    SignalProtocolAddress(
                            partner.e164, partner.deviceId
                    )
            )
            val fingerprintGenerator = NumericFingerprintGenerator(5200)
            fingerprintGenerator.createFor(
                    1,
                    localStableId,
                    localIdentityKey,
                    remoteStableId,
                    remoteIdentityKey
            )
        }
        return result
    }

    @ReactMethod
    fun compareFingerprint(qr: String, e164: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val result = getFingerprint(e164)?.let {    fingerprint ->
                        val scannableFingerprint = Base64.decode(qr)
                        fingerprint.scannableFingerprint.compareTo(scannableFingerprint)
                    } ?: throw Exception("cannot-get-fingerprint")

                    return@withContext result

                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
                Log.e("fingerprint", e.stackTraceToString())
            }
        }
    }

    @ReactMethod
    fun requireFingerprint(e164: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val result = getFingerprint(e164)?.let { fingerprint ->
                        val qr = Base64.encodeBytes(fingerprint.scannableFingerprint.serialized)
                        val displayText = fingerprint.displayableFingerprint.displayText
                        val result = Arguments.createMap()
                        result.putString("qrContent",qr)
                        result.putString("displayText",displayText)
                        result
                    } ?: throw Exception("cannot-get-fingerprint")

                    return@withContext result

                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
                Log.e("fingerprint", e.stackTraceToString())
            }
        }
    }

    @ReactMethod
    fun performKeyBundle(e164: String, bundle: ReadableMap, promise: Promise) {
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

                    val targetAddress = SignalProtocolAddress(e164, deviceId)


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
                Log.d("SignalError", e.stackTraceToString())
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun onRemoveAccount(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    return@withContext SignalRepository.resetApp()
                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject("stack",e.stackTraceToString())
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

                    val pref = reactApplicationContext.getSharedPreferences("application", ReactApplicationContext.MODE_PRIVATE)
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
    fun updateProfile(profile: ReadableMap, promise: Promise) {
        scope.launch {
            try {
                withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")
                    profile.getString("name")?.let { name ->
                        SignalRepository.account().setProfileName(name)
                    }
                    profile.getString("avatar")?.let { avatar ->
                        SignalRepository.account().setProfileAvatar(avatar)
                    }
                    return@withContext
                }
                promise.resolve(true)
            } catch (e: Exception) {
//                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun testPerformance(data: String, promise: Promise) {
        val test = Test()
        val pairOfSessions = test.initializeSessionsV3()
        val testResult = test.runTest(pairOfSessions,1000,data.toByteArray())
        val textResult = "Kết quả: \n" +
                "Thất bại: ${testResult.failed}\n" +
                "Encrypt: ${testResult.encryptionResult} mili giây \n" +
                "Decrypt: ${testResult.decryptionResult} mili giây"
        promise.resolve(textResult)
    }

    @ReactMethod
    fun getProfile(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")
                    val profile = Arguments.createMap()
                    profile.putString("name",SignalRepository.account().getProfileName())
                    profile.putString("avatar",SignalRepository.account().getProfileAvatar())
                    profile.putString("e164",SignalRepository.account().getE164())

                    return@withContext profile
                }
                promise.resolve(response)
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
                    AppDatabase.getInstance(reactApplicationContext).clearAllTables()
                    SignalDatabase.getInstance(reactApplicationContext).clearAllTables()
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


//    @ReactMethod
//    fun generateIdentityKeyPair(promise: Promise) {
//        val identityKeyPair = IdentityKeyPair.generate()
//        promise.resolve(Utils.fromBytes(identityKeyPair.serialize()))
//    }

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