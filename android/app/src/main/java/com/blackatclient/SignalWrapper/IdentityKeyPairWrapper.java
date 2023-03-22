package com.blackatclient.SignalWrapper;

import android.os.AsyncTask;

import org.signal.libsignal.protocol.IdentityKeyPair;

public class IdentityKeyPairWrapper {
    public static class Generate extends AsyncTask<Void,Void,byte[]> {

        @Override
        protected byte[] doInBackground(Void... voids) {
            IdentityKeyPair identityKeyPair = IdentityKeyPair.generate();
            return identityKeyPair.getPrivateKey().serialize();
        }

    }
}
