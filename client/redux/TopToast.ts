import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { TopToastProps, TopToastType } from "../components/TopToast"


interface TopToastState {
    value: TopToastProps
}

const initialState: TopToastState = {
    value: {
        content: '',
        visible: false,
        type: TopToastType.info
    }
}

interface TopToastPayload {
    content: string,
    duration?: number,
    type?: TopToastType
}

export const TopToastSlice = createSlice({
    name: 'socketConnection',
    initialState,
    reducers: {
        showTopToast: (state, action: PayloadAction<TopToastPayload>) => {
            state.value.content = action.payload.content
            state.value.duration = action.payload.duration
            state.value.type = action.payload.type !== undefined ? action.payload.type: TopToastType.info
            state.value.visible = true
        },
        resetTopToast: state => {
            state.value.content = ''
            state.value.visible = false
            state.value.duration = undefined
        },
    }
})

export const { showTopToast, resetTopToast } = TopToastSlice.actions

export default TopToastSlice.reducer