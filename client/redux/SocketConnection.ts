import { createSlice } from "@reduxjs/toolkit"
import { ConnectionState } from "realm"

interface SocketConnectionState {
    value: boolean
}

const initialState: SocketConnectionState = {
    value: false
}

export const SocketConnectionSlice = createSlice({
    name: 'socketConnection',
    initialState,
    reducers: {
        connected: state => {
            state.value = true
        },
        disconnected: state => {
            state.value = false
        },
    }
})

export const { connected, disconnected } = SocketConnectionSlice.actions

export default SocketConnectionSlice.reducer