import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { App } from '../../shared/types'


// Define a type for the slice state
interface ConversationWithMessagesState {
  value: Array<App.Types.ConversationWithMessages>
}

// Define the initial state using that type
const initialState: ConversationWithMessagesState = {
  value: []
}

export const ConversationWithMessagesSlice = createSlice({
  name: 'conversationWithMessages',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setConversationData: (state, action: PayloadAction<Array<App.Types.ConversationWithMessages>>) => {
      state.value = action.payload
    }
  }
})

export const { setConversationData } = ConversationWithMessagesSlice.actions

// // Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value

export default ConversationWithMessagesSlice.reducer