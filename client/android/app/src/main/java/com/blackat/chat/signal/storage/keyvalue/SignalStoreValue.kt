package com.blackat.chat.signal.storage.keyvalue

import com.blackat.chat.data.converter.Converters
import com.blackat.chat.data.dao.KeyValueDao
import com.blackat.chat.data.model.*
import com.blackat.chat.utils.Base64
import java.security.Key


abstract class SignalStoreValues(private val store: KeyValueDao) {
//
//  abstract fun onFirstEverAppLaunch()
//
//  abstract val keysToIncludeInBackup: List<String?>?

  suspend fun contain(key: String): Boolean {
    val query = store.get(key) ?: return false
    return true
  }

//  suspend fun getString(key: String, defaultValue: String): String {
//    val query = store.get(key)
//    var result = defaultValue
//    query?.let {
//      result = it.value
//    }
//    return result
//  }

  suspend fun getString(key: String, defaultValue: String?): String? {
    val query = store.get(key)
    var result = defaultValue
    query?.let {
      result = it.value
    }
    return result
  }

//  suspend fun getInteger(key: String, defaultValue: Int): Int {
//    val query = store.get(key)
//    var result = defaultValue
//    query?.let {
//      if (it.type == KeyValue.INTEGER_TYPE)
//      result = it.value.toInt()
//    }
//    return result
//  }

  suspend fun getInteger(key: String, defaultValue: Int?): Int? {
    val query = store.get(key)
    var result = defaultValue
    query?.let {
      if (it.type == KeyValue.INTEGER_TYPE)
        result = it.value.toInt()
    }
    return result
  }

//  suspend fun getLong(key: String, defaultValue: Long): Long {
//    val query = store.get(key)
//    var result = defaultValue
//    query?.let {
//      if (it.type == KeyValue.LONG_TYPE)
//        result = it.value.toLong()
//    }
//    return result
//  }

  suspend fun getLong(key: String, defaultValue: Long?): Long? {
    val query = store.get(key)
    var result = defaultValue
    query?.let {
      if (it.type == KeyValue.LONG_TYPE)
        result = it.value.toLong()
    }
    return result
  }

//  suspend fun getBoolean(key: String, defaultValue: Boolean): Boolean {
//    val query = store.get(key)
//    var result = defaultValue
//    query?.let {
//      if (it.type == KeyValue.BOOLEAN_TYPE)
//        result = it.value.toBoolean()
//    }
//    return result
//  }

  suspend fun getBoolean(key: String, defaultValue: Boolean?): Boolean? {
    val query = store.get(key)
    var result = defaultValue
    query?.let {
      if (it.type == KeyValue.BOOLEAN_TYPE)
        result = it.value.toBoolean()
    }
    return result
  }

//  suspend fun getFloat(key: String, defaultValue: Float): Float {
//    val query = store.get(key)
//    var result = defaultValue
//    query?.let {
//      if (it.type == KeyValue.FLOAT_TYPE)
//        result = it.value.toFloat()
//    }
//    return result
//  }

  suspend fun getFloat(key: String, defaultValue: Float?): Float? {
    val query = store.get(key)
    var result = defaultValue
    query?.let {
      if (it.type == KeyValue.FLOAT_TYPE)
        result = it.value.toFloat()
    }
    return result
  }

//  suspend fun getBlob(key: String, defaultValue: ByteArray): ByteArray {
//    val query = store.get(key)
//    var result = defaultValue
//    query?.let {
//      if (it.type == KeyValue.BLOB_TYPE)
//        result = Base64.decode(it.value)
//    }
//    return result
//  }

  suspend fun getBlob(key: String, defaultValue: ByteArray?): ByteArray? {
    val query = store.get(key)
    var result = defaultValue
    query?.let {
      if (it.type == KeyValue.BLOB_TYPE)
        result = Base64.decode(it.value)
    }
    return result
  }

//  fun <T> getObject(key: String, defaultValue: T?, serializer: org.gradle.internal.impldep.com.esotericsoftware.kryo.serializers.DefaultSerializers.ByteSerializer<T>): T {
//    val blob: ByteArray = store.getBlob(key, null)
//    return if (blob == null) {
//      defaultValue
//    } else {
//      serializer.deserialize(blob)
//    }
//  }

//  fun <T> getList(@NonNull key: String?, @NonNull serializer: StringSerializer<T>?): List<T> {
//    val blob = getBlob(key, null) ?: return Collections.emptyList()
//    return try {
//      val signalStoreList: SignalStoreList = SignalStoreList.parseFrom(blob)
//      signalStoreList.getContentsList()
//              .stream()
//              .map(serializer::deserialize)
//              .collect(Collectors.toList())
//    } catch (e: InvalidProtocolBufferException) {
//      throw IllegalArgumentException(e)
//    }
//  }

//  fun putBlob(@NonNull key: String?, value: ByteArray?) {
//    store.beginWrite().putBlob(key, value).apply()
//  }

  suspend fun putBoolean(key: String, value: Boolean) {
    store.put(KeyValue(key,value))
  }

  suspend fun putFloat(key: String, value: Float) {
    store.put(KeyValue(key,value))
  }

  suspend fun putInteger(key: String, value: Int) {
    store.put(KeyValue(key,value))
  }

  suspend fun putLong(key: String, value: Long) {
    store.put(KeyValue(key,value))
  }

  suspend fun putString(key: String, value: String) {
    store.put(KeyValue(key,value))
  }

  suspend fun putBlob(key: String, value: ByteArray) {
    store.put(KeyValue(key,value))
  }


//  fun <T> putObject(key: String?, value: T, @NonNull serializer: org.gradle.internal.impldep.com.esotericsoftware.kryo.serializers.DefaultSerializers.ByteSerializer<T>) {
//    putBlob(key, serializer.serialize(value))
//  }
//
//  fun <T> putList(@NonNull key: String?, @NonNull values: List<T>, @NonNull serializer: StringSerializer<T>?) {
//    putBlob(key, SignalStoreList.newBuilder()
//            .addAllContents(values.stream()
//                    .map<Any>(serializer::serialize)
//                    .collect(Collectors.toList()))
//            .build()
//            .toByteArray())
//  }

  suspend fun remove(key: String) {
    store.delete(key)
  }
}