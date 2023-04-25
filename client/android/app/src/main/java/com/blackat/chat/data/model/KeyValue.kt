package com.blackat.chat.data.model

import androidx.room.*
import com.blackat.chat.data.converter.Converters

@Entity(tableName = "key_value", indices = [
    Index(value = ["key"], unique = true)
])
data class KeyValue(
        val key: String,
        val value: String,
        val type: Int = STRING_TYPE,
        ) {
    @PrimaryKey(autoGenerate = true)
    var id: Int? = null

    @Ignore
    constructor(key: String, value: Int) : this(key,value.toString(), INTEGER_TYPE)
    @Ignore
    constructor(key: String, value: Float) : this(key,value.toString(), FLOAT_TYPE)
    @Ignore
    constructor(key: String, value: Long) : this(key,value.toString(), LONG_TYPE)
    @Ignore
    constructor(key: String, value: Boolean) : this(key,value.toString(), BOOLEAN_TYPE)
    @Ignore
    constructor(key: String, value: ByteArray) : this(key,Converters().fromByteArray(value), BLOB_TYPE)

    companion object {
        const val STRING_TYPE = 0
        const val INTEGER_TYPE = 1
        const val LONG_TYPE = 2
        const val BOOLEAN_TYPE = 3
        const val FLOAT_TYPE = 4
        const val BLOB_TYPE = 5
    }
}


data class KeyValueInt(
        val key: String,
        val value: Int,

) {
    val type: Int = KeyValue.INTEGER_TYPE
}

data class KeyValueFloat(
        val key: String,
        val value: Float,
) {
    val type: Int = KeyValue.FLOAT_TYPE
}


data class KeyValueBool(
        val key: String,
        val value: Boolean,
) {
    val type: Int = KeyValue.BOOLEAN_TYPE
}

data class KeyValueLong(
        val key: String,
        val value: Long,
) {
    val type: Int = KeyValue.LONG_TYPE
}

data class KeyValueBlob(
        val key: String,
        val value: ByteArray,
) {
    val type: Int = KeyValue.BLOB_TYPE
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as KeyValueBlob

        if (key != other.key) return false
        if (!value.contentEquals(other.value)) return false
        if (type != other.type) return false

        return true
    }

    override fun hashCode(): Int {
        var result = key.hashCode()
        result = 31 * result + value.contentHashCode()
        result = 31 * result + type
        return result
    }
}
