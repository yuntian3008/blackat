package com.blackat.chat.signal.storage

import com.blackat.chat.data.dao.KeyValueDao
import com.blackat.chat.data.model.KeyValue
import com.blackat.chat.signal.crypto.IdentityKeyUtil
import com.blackat.chat.signal.storage.keyvalue.SignalStoreValues
import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.ecc.Curve
import org.signal.libsignal.protocol.util.KeyHelper
import org.signal.libsignal.protocol.util.Medium
import java.security.SecureRandom

class AccountStore(private val store: KeyValueDao) : SignalStoreValues(store) {

    companion object {
        private const val E164: String = "account.e164"
        private const val LOCAL_DEVICE_ID = "account.local_device_id"
        private const val REGISTRATION_ID: String = "account.registration_id"

        private const val PIN_CODE: String = "account.pin_code"

        private const val PROFILE_NAME: String = "account.profile_name"
        private const val PROFILE_AVATAR: String = "account.profile_avatar"

        private const val KEY_IDENTITY_PUBLIC_KEY = "account.identity_public_key"
        private const val KEY_IDENTITY_PRIVATE_KEY = "account.identity_private_key"

        private const val KEY_SIGNED_PREKEY_REGISTERED = "account.signed_prekey_registered"

        private const val KEY_ACTIVE_SIGNED_PREKEY_ID = "account.active_signed_prekey_id"
        private const val KEY_SIGNED_PREKEY_FAILURE_COUNT = "account.signed_prekey_failure_count"

        private const val KEY_NEXT_SIGNED_PREKEY_ID = "account.next_signed_prekey_id"
        private const val KEY_NEXT_ONE_TIME_PREKEY_ID = "account.next_one_time_prekey_id"
    }

    suspend fun regenerateRegistrationId() {
        if (contain(AccountStore.REGISTRATION_ID))
            putInteger(AccountStore.REGISTRATION_ID, KeyHelper.generateRegistrationId(false))
    }

    suspend fun generateRegistrationIdIfNecessary() {
        if (!contain(AccountStore.REGISTRATION_ID))
            putInteger(AccountStore.REGISTRATION_ID, KeyHelper.generateRegistrationId(false))
    }

    suspend fun getRegistrationId(): Int {
        generateRegistrationIdIfNecessary()
        return getInteger(AccountStore.REGISTRATION_ID, 0)!!
    }

    suspend fun regenerateNextSignedPreKeyId() {
        if (contain(AccountStore.KEY_NEXT_SIGNED_PREKEY_ID))
            putInteger(AccountStore.KEY_NEXT_SIGNED_PREKEY_ID, SecureRandom().nextInt(Medium.MAX_VALUE))
    }

    suspend fun generateNextSignedPreKeyIdIfNecessary() {
        if (!contain(AccountStore.KEY_NEXT_SIGNED_PREKEY_ID))
            putInteger(AccountStore.KEY_NEXT_SIGNED_PREKEY_ID, SecureRandom().nextInt(Medium.MAX_VALUE))
    }

    suspend fun getNextSignedPreKeyId(): Int {
        generateNextSignedPreKeyIdIfNecessary()
        return getInteger(KEY_NEXT_SIGNED_PREKEY_ID, SecureRandom().nextInt(Medium.MAX_VALUE))!!
    }

    suspend fun setNextSignedPreKeyId(value: Int) {
        putInteger(KEY_NEXT_SIGNED_PREKEY_ID, value = value)
    }

    suspend fun setE164(value: String) {
        if (!contain(E164)) {
            putString(E164, value)
        }
    }

    suspend fun resetE164() {
        remove(E164)
    }

    suspend fun getE164(): String? {
        return getString(E164,null)
    }

    suspend fun setPin(value: String) {
        putString(PIN_CODE, value)
    }

    suspend fun resetPin() {
        remove(PIN_CODE)
    }

    suspend fun getPin(): String? {
        return getString(PIN_CODE,null)
    }

    suspend fun setProfileName(value: String) {
        putString(PROFILE_NAME, value)
    }

    suspend fun resetProfileName() {
        remove(PROFILE_NAME)
    }

    suspend fun getProfileName(): String? {
        return getString(PROFILE_NAME,null)
    }

    suspend fun setProfileAvatar(value: String) {
        putString(PROFILE_AVATAR, value)
    }

    suspend fun resetProfileAvatar() {
        remove(PROFILE_AVATAR)
    }

    suspend fun getProfileAvatar(): String? {
        return getString(PROFILE_AVATAR,null)
    }


    suspend fun setLocalDeviceId(value: Int) {
        if (!contain(LOCAL_DEVICE_ID)) {
            putInteger(LOCAL_DEVICE_ID, value)
        }
    }

    suspend fun resetLocalDeviceId() {
        remove(LOCAL_DEVICE_ID)
    }

    suspend fun getLocalDeviceId(): Int? {
        return getInteger(LOCAL_DEVICE_ID,null)
    }

    suspend fun regenerateNextOneTimePreKeyId() {
        if (contain(AccountStore.KEY_NEXT_ONE_TIME_PREKEY_ID))
            putInteger(AccountStore.KEY_NEXT_ONE_TIME_PREKEY_ID, SecureRandom().nextInt(Medium.MAX_VALUE))
    }

    suspend fun generateNextOneTimePreKeyIdIfNecessary() {
        if (!contain(AccountStore.KEY_NEXT_ONE_TIME_PREKEY_ID))
            putInteger(AccountStore.KEY_NEXT_ONE_TIME_PREKEY_ID, SecureRandom().nextInt(Medium.MAX_VALUE))
    }

    suspend fun getNextOneTimePreKeyId(): Int {
        generateNextSignedPreKeyIdIfNecessary()
        return getInteger(KEY_NEXT_ONE_TIME_PREKEY_ID, SecureRandom().nextInt(Medium.MAX_VALUE))!!
    }

    suspend fun setNextOneTimePreKeyId(value: Int) {
        putInteger(KEY_NEXT_ONE_TIME_PREKEY_ID, value = value)
    }

    suspend fun regenerateIdentityKeyPair() {
        if (!hasIdentityKeyPair()) return;

        val key = IdentityKeyUtil.generateIdentityKeyPair()
        putBlob(KEY_IDENTITY_PUBLIC_KEY, key.publicKey.serialize())
        putBlob(KEY_IDENTITY_PRIVATE_KEY, key.privateKey.serialize())
    }

    suspend fun generateIdentityKeyPairIfNecessary() {
        if (hasIdentityKeyPair()) return;

        val key = IdentityKeyUtil.generateIdentityKeyPair()
        putBlob(KEY_IDENTITY_PUBLIC_KEY, key.publicKey.serialize())
        putBlob(KEY_IDENTITY_PRIVATE_KEY, key.privateKey.serialize())
    }

    private suspend fun hasIdentityKeyPair(): Boolean {
        return contain(AccountStore.KEY_IDENTITY_PUBLIC_KEY)
    }

    suspend fun getIdentityKeyPair(): IdentityKeyPair {
        require(hasIdentityKeyPair()) { "Not set yet!" }
        return IdentityKeyPair(
                IdentityKey(getBlob(KEY_IDENTITY_PUBLIC_KEY, null)),
                Curve.decodePrivatePoint(getBlob(KEY_IDENTITY_PRIVATE_KEY, null))
        )
    }


//    @get:JvmName("aciPreKeys")
//    val aciPreKeys: PreKeyMetadataStore = object : PreKeyMetadataStore {
//        override var nextSignedPreKeyId: Int = IntVa (KEY_NEXT_SIGNED_PREKEY_ID, SecureRandom().nextInt(Medium.MAX_VALUE))
//        override var activeSignedPreKeyId: Int by integerValue(KEY_ACTIVE_SIGNED_PREKEY_ID, -1)
//        override var isSignedPreKeyRegistered: Boolean by booleanValue(KEY_SIGNED_PREKEY_REGISTERED, false)
//        override var signedPreKeyFailureCount: Int by integerValue(KEY_SIGNED_PREKEY_FAILURE_COUNT, 0)
//        override var nextOneTimePreKeyId: Int by integerValue(KEY_NEXT_ONE_TIME_PREKEY_ID, SecureRandom().nextInt(Medium.MAX_VALUE))
//    }

}

