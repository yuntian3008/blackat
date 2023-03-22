package com.blackatclient;

import android.os.AsyncTask;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import org.signal.libsignal.protocol.IdentityKey;
import org.signal.libsignal.protocol.IdentityKeyPair;
import org.signal.libsignal.protocol.ecc.ECPrivateKey;

public class SignalModule extends ReactContextBaseJavaModule {
    SignalModule(ReactApplicationContext context) {
        super(context);
    }
    @NonNull
    @Override
    public String getName() {
        return "SignalModule";
    }

    @ReactMethod
    public void generateIdentityKeyPair(Promise promise) {
        IdentityKeyPair identityKeyPair = IdentityKeyPair.generate();
        promise.resolve(Utils.fromBytes(identityKeyPair.serialize()));
    }
}
