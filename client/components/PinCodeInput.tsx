import { useEffect, useState } from "react"
import { Dialog, HelperText, Portal, TextInput, Button } from "react-native-paper"
import { View, useColorScheme } from "react-native"
import { darkThemeWithoutRoundness, lightThemeWithoutRoundness } from "../theme"

type PinCodeInputProps = {
    isNew?: boolean
    visible: boolean,
    dismiss: () => void
    submit: (pin: string) => void
}

const PinCodeInput = ({
    isNew,
    visible,
    dismiss,
    submit
}: PinCodeInputProps): JSX.Element => {
    const [input, setInput] = useState<string>()
    const [confirmInput, setConfirmInput] = useState<string>()
    const [inputError, setInputError] = useState<string>()
    const [confirmInputError, setConfirmInputError] = useState<string>()
    const [disableSubmit, setDisableSubmit] = useState<boolean>(true)
    const [secureInput, setSecureInput] = useState<boolean>(true)
    const [secureConfirmInput, setSecureConfirmInput] = useState<boolean>(true)

    const clearInput = () => setInput("")
    const clearConfirmInput = () => setConfirmInput("")

    const submitInput = () => {
        const pin = input!
        submit(pin)
        close()
    }

    const close = () => {
        clearInput()
        clearConfirmInput()
        dismiss()
    }

    useEffect(() => {
        const allowSubmit = (input !== undefined && input.length == 4) && (isNew ? (confirmInput !== undefined && confirmInput.length == 4 && confirmInput == input) : true)
        let inputErrorText = undefined
        let confirmInputErrorText = undefined
        const willShowConfirmInputError = isNew && confirmInput !== undefined
        const willShowInputError = input !== undefined
        if (willShowConfirmInputError && (confirmInput != input)) confirmInputErrorText = "Mã pin không trùng khớp"
        if (willShowInputError && (input.length !== 4)) inputErrorText = "Mã pin phải có 4 chữ số"

        setDisableSubmit(!allowSubmit)
        setInputError(inputErrorText)
        setConfirmInputError(confirmInputErrorText)

    }, [input, confirmInput])

    const schema = useColorScheme()
    return (
        <Portal>

            <Dialog visible={visible} onDismiss={close} style={{ borderRadius: 20 }} theme={schema == 'dark' ? darkThemeWithoutRoundness : lightThemeWithoutRoundness}>
                <Dialog.Title>{isNew ? "Tạo mã pin mới" : "Nhập mã pin"}</Dialog.Title>
                <Dialog.Content>
                    <View>
                        <TextInput
                            autoComplete="off"
                            maxLength={4}
                            inputMode="numeric"
                            secureTextEntry={secureInput}
                            keyboardType="number-pad"
                            label="Mã pin"
                            value={input}
                            onChangeText={text => setInput(text.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, ''))}
                            right={<TextInput.Icon onPress={() => setSecureInput(!secureInput)} icon={secureInput ? 'eye-outline' : 'eye-off-outline'} />}
                        />
                        <HelperText type="error" visible={inputError !== undefined}>
                            {inputError}
                        </HelperText>
                    </View>

                    {
                        isNew ? (
                            <View>
                                <TextInput
                                    autoComplete="off"
                                    maxLength={4}
                                    inputMode="numeric"
                                    secureTextEntry={secureConfirmInput}
                                    keyboardType="number-pad"
                                    label="Nhập lại mã pin"
                                    value={confirmInput}
                                    onChangeText={text => setConfirmInput(text.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, ''))}
                                    right={<TextInput.Icon onPress={() => setSecureConfirmInput(!secureConfirmInput)} icon={secureConfirmInput ? 'eye-outline' : 'eye-off-outline'} />}
                                />
                                <HelperText type="error" visible={confirmInputError !== undefined}>
                                    {confirmInputError}
                                </HelperText>
                            </View>

                        ) : null
                    }
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={close}>Hủy</Button>
                    <Button disabled={disableSubmit} onPress={submitInput}>Xác nhận</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}

export default PinCodeInput