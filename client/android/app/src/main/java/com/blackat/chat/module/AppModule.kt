package com.blackat.chat.module

import android.util.Log
import androidx.lifecycle.Observer
import com.blackat.chat.data.database.AppDatabase
import com.blackat.chat.data.model.MessageState
import com.blackat.chat.data.model.Partner
import com.blackat.chat.data.model.PrivateConversationWithMessages
import com.blackat.chat.data.repository.AppRepository
import com.blackat.chat.data.repository.SignalRepository
import com.blackat.chat.utils.ReadableMapUtils
import com.blackat.chat.utils.WritableArrayUtils
import com.blackat.chat.utils.WritableMapUtils
import com.blackat.chat.viewmodel.AppViewModel
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.password4j.Password
import kotlinx.coroutines.*

class AppModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context), LifecycleEventListener {

    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val listenerScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val appViewModel = AppViewModel(AppDatabase.getInstance(context))

    init {
        context.addLifecycleEventListener(this)
    }
    override fun getName(): String {
        return "AppModule"
    }

    override fun getConstants(): MutableMap<String, Any> {
        val constants = hashMapOf<String, Any>()
//        constants["CURRENT_COUNTRY_CODE"] = getCurrentCountryCode().uppercase(Locale.getDefault())
        return constants
    }

    private fun emitEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
    }

    private fun emitEvent(eventName: String, params: WritableArray?) {
        reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
    }

    private var listenerCount = 0

    private val observerPrivateConversationWithMessagesList = Observer<List<PrivateConversationWithMessages>> {
        emitEvent("conversationWithMessageChanged",WritableArrayUtils.getPrivateConversationsWithMessages(it))
        Log.d("listenerReact", "emitted")
    }

    @ReactMethod
    fun addListener(eventName: String) {
        if (listenerCount == 0) {
            listenerScope.launch {
                try {
                    Log.d("listenerReact", "start")

                    appViewModel.getConversationWithMessagesListLiveData().observeForever(observerPrivateConversationWithMessagesList)
//                    AppRepository.privateConversation().getAllFlow().collect() { list ->
//                        list.forEach() {
//                            sendEvent(reactApplicationContext,"test", WritableMapUtils.getPrivateConversation(it))
//                        }
//                        Log.d("listenerReact", "changed")
//                    }

                } catch (e: Exception) {
                    Log.e("addListener",e.message ?: "")
                }
            }
        }

        listenerCount += 1
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        listenerCount -= count
        if (listenerCount == 0) {
            listenerScope.cancel()
        }
    }


//    @ReactMethod
//    fun testEvent() {
//        sendEvent(reactApplicationContext,"test",WritableMapUtils.getAddress(SignalProtocolAddress(
//                "abc",123
//        )))
//    }

    @ReactMethod
    fun removeConversation(e164: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")



                    return@withContext AppRepository.privateConversation().remove(e164)
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun createConversation(e164: String, firstMessage: ReadableMap, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    return@withContext AppRepository.privateConversation().create(
                            e164,
                            ReadableMapUtils.getMessage(firstMessage)
                    )
                }
                response?.let {
                    promise.resolve(response)
                } ?: promise.reject(Exception("cannot-create-conversation"))
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun ting(e164: String, promise: Promise) {
        scope.launch {
            try {
                withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    AppRepository.privateConversation().ting(e164)


                    return@withContext;
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun getPartner(e164: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val partner = AppRepository.partner().getByE164(e164)


                    return@withContext partner?.let { WritableMapUtils.getPartner(partner) };
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun removePartnerNickname(e164: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    AppRepository.partner().changeNickname(e164, null)


                    return@withContext true
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun getEnablePinSecurity(e164: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val conversation = AppRepository.privateConversation().get(e164)
                    return@withContext conversation?.enablePinSecurity
                }
                if (response == null)
                    promise.reject(Exception("cannot-found-conversation"))
                else
                    promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun changeEnablePinSecurity(e164: String, state: Boolean, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    AppRepository.privateConversation().changeEnablePinSecurity(e164, state)

                    return@withContext true
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun requirePin(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val hashed = SignalRepository.account().getPin()
                    hashed ?: return@withContext false
                    return@withContext true
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun verifyPin(pin: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val hashed = SignalRepository.account().getPin()
                    return@withContext Password.check(pin, hashed).withArgon2()
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun setPin(pin: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val hashed = Password.hash(pin).addRandomSalt().withArgon2().result
                    SignalRepository.account().setPin(hashed)

                    return@withContext true
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun changePartnerNickname(e164: String, nickname: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    AppRepository.partner().changeNickname(e164, nickname)


                    return@withContext true
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun upsertPartnerProfile(sender: ReadableMap,profile: ReadableMap, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val senderAddress = ReadableMapUtils.getAddress(sender)

                    val partner = Partner(senderAddress.name, senderAddress.deviceId)
                    profile.getString("name")?.let { name ->
                        partner.name = name
                    }
                    profile.getString("avatar")?.let { avatar ->
                        partner.avatar = avatar
                    }

                    AppRepository.partner().upsert(partner)



                    return@withContext true;
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun getSendingMessages(promise: Promise) {
        scope.launch {
            try {
                val result = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val conversation = AppRepository.privateMessage().getMessageWithE164List()

                    val array = Arguments.createArray()

                    conversation.forEach() {
                        val record = Arguments.createMap()
                        record.putInt("id",it.id)
                        record.putMap("message",WritableMapUtils.getMessage(it.message))
                        it.message.fileInfo?.let { fileInfo ->
                            record.putMap("fileInfo",WritableMapUtils.getFileInfo(fileInfo))
                        }
                        record.putString("e164",it.e164)
                        array.pushMap(record)
                        Log.d("testBlackat", "${it.e164} - ${it.message.data} - ${it.message.state}")
                    }

                    return@withContext array;
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject(e)
                Log.e("testError",e.stackTraceToString())
            }
        }
    }

    @ReactMethod
    fun markAllPartnerMessageAsRead(conversationId: Int, promise: Promise) {
        scope.launch {
            try {
                val result = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    AppRepository.privateMessage().markAllPartnerMessageAsRead(conversationId)


                    return@withContext;
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(e)
                Log.e("testError",e.stackTraceToString())
            }
        }
    }

    @ReactMethod
    fun markAllPartnerMessageAsUnread(conversationId: Int, promise: Promise) {
        scope.launch {
            try {
                val result = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    AppRepository.privateMessage().markAllPartnerMessageAsUnread(conversationId)


                    return@withContext;
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(e)
                Log.e("testError",e.stackTraceToString())
            }
        }
    }

    @ReactMethod
    fun markAsSent(id: Int, promise: Promise) {
        scope.launch {
            try {
                val result = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    AppRepository.privateMessage().markAsSent(id)


                    return@withContext;
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(e)
                Log.e("testError",e.stackTraceToString())
            }
        }
    }

    @ReactMethod
    fun markAsError(id: Int, promise: Promise) {
        scope.launch {
            try {
                val result = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    AppRepository.privateMessage().markAsError(id)


                    return@withContext;
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(e)
                Log.e("testError",e.stackTraceToString())
            }
        }
    }

    private suspend fun saveMessageNative(e164: String, message: ReadableMap, messageState: String, fileInfoMap: ReadableMap?) {
        val conversation = AppRepository.privateConversation().get(e164)
        val msg = ReadableMapUtils.getMessage(message)
        msg.state = MessageState.valueOf(messageState)
        fileInfoMap?.let {
            msg.fileInfo = ReadableMapUtils.getFileInfo(it)
        }

        val partner = AppRepository.partner().getByE164(e164)
        partner ?: AppRepository.partner().upsert(e164,0)
//
//        if (msg.type == Message.PROFILE_TYPE && msg.owner == Message.PARTNER) {
//            JSONObject(msg.data).
//        }

        conversation?.let {
            AppRepository.privateMessage().save(msg,it.id!!)
        } ?: AppRepository.privateConversation().create(e164,msg)
    }

    @ReactMethod
    fun saveFileMessage(e164: String, message: ReadableMap, messageState: String, fileInfoMap: ReadableMap, promise: Promise) {
        scope.launch {
            try {
                withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    saveMessageNative(e164,message,messageState,fileInfoMap)


                    return@withContext;
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun saveMessage(e164: String, message: ReadableMap, messageState: String, promise: Promise) {

        scope.launch {
            try {
                withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    saveMessageNative(e164,message,messageState,null)


                    return@withContext;
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

//    @ReactMethod
//    fun saveMessage(conversationId: Int, message: ReadableMap) {
//        scope.launch {
//            try {
//                withContext(context = Dispatchers.IO) {
//                    if (reactApplicationContext == null)
//                        throw Exception("context null")
//
//                    val newMessage = ReadableMapUtils.getMessage(message)
//                    if (newMessage.owner == Message.SELF)
//                        newMessage.state = MessageState.SENDING
//
//                    return@withContext AppRepository.privateMessage().save(
//                        newMessage,
//                        conversationId
//                    )
//                }
//
//            } catch (_: Exception) {
//            }
//        }
//    }

    fun isExistedConversation(e164: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    return@withContext AppRepository.privateConversation().contain(e164)
                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun loadMessage(e164: String, promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    return@withContext AppRepository.privateConversation().getOneWithMessages(e164)?.let { WritableMapUtils.getPrivateConversationWithMessages(it) }
                }
                response?.let {
                    promise.resolve(response)
                } ?: promise.reject(Exception("not-found-conversation"))

            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }




    @ReactMethod
    fun getConversationList(promise: Promise) {
        scope.launch {
            try {
                val response = withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val result: WritableArray = WritableNativeArray()

                    val privateConversationList = AppRepository.privateConversation().getAll()

                    privateConversationList.forEach() {
                        val conversation = WritableNativeMap()
                        conversation.putInt("id", it.id!!)
                        conversation.putString("e164", it.e164)
                        result.pushMap(conversation)
                    }

                    return@withContext result
                }

                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }


    override fun onHostResume() {

    }

    override fun onHostPause() {

    }

    override fun onHostDestroy() {
        scope.cancel()
    }
}