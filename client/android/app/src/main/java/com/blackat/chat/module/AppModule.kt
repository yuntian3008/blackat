package com.blackat.chat.module

import android.util.Log
import androidx.lifecycle.Observer
import com.blackat.chat.data.database.AppDatabase
import com.blackat.chat.data.model.PrivateConversationWithMessages
import com.blackat.chat.data.repository.AppRepository
import com.blackat.chat.utils.ReadableMapUtils
import com.blackat.chat.utils.WritableArrayUtils
import com.blackat.chat.utils.WritableMapUtils
import com.blackat.chat.viewmodel.AppViewModel
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
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
    fun saveMessage(e164: String, message: ReadableMap, promise: Promise) {
        scope.launch {
            try {
                withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")

                    val conversation = AppRepository.privateConversation().get(e164)
                    val msg = ReadableMapUtils.getMessage(message)

                    conversation?.let {
                        AppRepository.privateMessage().save(msg,it.id!!)
                    } ?: AppRepository.privateConversation().create(e164,msg)


                    return@withContext;
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    @ReactMethod
    fun saveMessage(conversationId: Int, message: ReadableMap) {
        scope.launch {
            try {
                withContext(context = Dispatchers.IO) {
                    if (reactApplicationContext == null)
                        throw Exception("context null")


                    return@withContext AppRepository.privateMessage().save(
                            ReadableMapUtils.getMessage(message),
                            conversationId
                    )
                }

            } catch (_: Exception) {
            }
        }
    }

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