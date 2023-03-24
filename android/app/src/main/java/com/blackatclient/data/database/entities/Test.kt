package com.blackatclient.data.database.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class Test(
        @PrimaryKey(autoGenerate = true) val id: Int = 0,
        @ColumnInfo(name = "col1") val col1: String?,
        @ColumnInfo(name = "col2") val col2: String?
) {
    constructor(col1: String?, col2: String?) : this(0,col1, col2)
}