import TopToast from './redux/TopToast';
import { configureStore } from '@reduxjs/toolkit'
import ConversationWithMessages from './redux/ConversationWithMessages'
import SocketConnection from './redux/SocketConnection'
// ...

const store = configureStore({
  reducer: {
    conversationData: ConversationWithMessages,
    socketConnection: SocketConnection,
    topToast : TopToast
    // comments: commentsReducer,
    // users: usersReducer
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store