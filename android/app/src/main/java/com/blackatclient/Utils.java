package com.blackatclient;

import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

public class Utils {
    public static WritableArray fromBytes(byte[] bytes) {
        WritableArray array = new WritableNativeArray();
        for (byte i : bytes) {
            array.pushInt(i);
        }
        return array;
    }
}
