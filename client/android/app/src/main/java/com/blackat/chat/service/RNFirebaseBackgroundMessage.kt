package com.blackat.chat.service

import android.app.Service
import android.content.Intent
import android.os.IBinder
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class RNFirebaseBackgroundMessage : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        return intent.extras?.let {
            HeadlessJsTaskConfig(
                    "RNFirebaseBackgroundMessage",
                    Arguments.fromBundle(it),
                    5000,
                    false,
            )
        }
    }
}