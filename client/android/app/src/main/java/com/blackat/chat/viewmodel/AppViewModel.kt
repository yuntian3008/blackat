package com.blackat.chat.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MediatorLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import com.blackat.chat.data.database.AppDatabase
import com.blackat.chat.data.model.PrivateConversation
import com.blackat.chat.data.model.PrivateConversationWithMessages

class AppViewModel(appDatabase: AppDatabase): ViewModel() {
    private val conversationWithMessagesListLiveData = MediatorLiveData<List<PrivateConversationWithMessages>>()

    init {
        val privateConversationDao = appDatabase.privateConversationDao()
        conversationWithMessagesListLiveData.addSource(privateConversationDao.getAllWithMessages().asLiveData()) {
            conversationWithMessagesListLiveData.postValue(it)
        }
    }

    fun getConversationWithMessagesListLiveData(): LiveData<List<PrivateConversationWithMessages>> = conversationWithMessagesListLiveData
}