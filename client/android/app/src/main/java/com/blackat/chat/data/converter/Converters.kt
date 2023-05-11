package com.blackat.chat.data.converter

import androidx.room.TypeConverter
import com.blackat.chat.data.model.IdentityKey
import com.blackat.chat.data.model.MessageState
import com.blackat.chat.utils.Base64
import org.signal.libsignal.protocol.ecc.Curve
import org.signal.libsignal.protocol.ecc.ECPrivateKey
import org.signal.libsignal.protocol.ecc.ECPublicKey
import org.signal.libsignal.protocol.state.SessionRecord

class Converters {
    @TypeConverter
    fun toMessageState(value: String) = enumValueOf<MessageState>(value)
    @TypeConverter
    fun fromMessageState(value: MessageState) = value.name
    @TypeConverter
    fun fromByteArray(bytes: ByteArray): String = Base64.encodeBytes(bytes)
    @TypeConverter
    fun toByteArray(string: String): ByteArray = Base64.decode(string)

    @TypeConverter
    fun fromECPrivateKey(privateKey: ECPrivateKey): String = Base64.encodeBytes(privateKey.serialize())
    @TypeConverter
    fun toECPrivateKey(string: String): ECPrivateKey = Curve.decodePrivatePoint(Base64.decode(string))

    @TypeConverter
    fun fromECPublicKey(publicKey: ECPublicKey): String = Base64.encodeBytes(publicKey.serialize())
    @TypeConverter
    fun toECPublicKey(string: String): ECPublicKey = Curve.decodePoint(Base64.decode(string),0)

    @TypeConverter
    fun fromSessionRecord(sessionRecord: SessionRecord): String = Base64.encodeBytes(sessionRecord.serialize())
    @TypeConverter
    fun toSessionRecord(string: String): SessionRecord = SessionRecord(Base64.decode(string))


}