import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { TopToastProps, TopToastType } from "../components/TopToast"


// interface TopToastState {
//     value: Array<TopToastProps>
// }

const initialState: Array<TopToastProps> = []

// interface TopToastPayload {
//     index: number,
//     item: TopToastProps
// }

export const TopToastSlice = createSlice({
    name: 'socketConnection',
    initialState,
    reducers: {
        enqueueTopToast: (state, action: PayloadAction<TopToastProps>) => {
            state.push(action.payload)
        },
        dequeueTopToast: (state) => {
            state.shift()
        }
        // showTopToast: (state, action: PayloadAction<TopToastPayload>) => {
        //     state.value.content = action.payload.content
        //     state.value.duration = action.payload.duration
        //     state.value.type = action.payload.type !== undefined ? action.payload.type: TopToastType.info
        //     state.value.visible = true
        // },
        // resetTopToast: state => {
        //     state.value.content = ''
        //     state.value.visible = false
        //     state.value.duration = undefined
        // },
    }
})

export const { enqueueTopToast, dequeueTopToast } = TopToastSlice.actions

export default TopToastSlice.reducer