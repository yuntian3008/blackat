import { set } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, BackHandler, Keyboard, Text, TextInput, ToastAndroid, View } from "react-native"
import { IconButton, Menu, useTheme } from "react-native-paper"
import { AppTheme } from "../theme";
import { ScrollView } from "react-native-gesture-handler";
import { StickerPicker } from "./StickerPicker";
import { useFocusEffect } from "@react-navigation/native";

export type ChatControllerProps = {
    onCameraPress: () => void,
    onGalleryPress: () => void,
    onSendPress: (message: string) => void,
    onChooseSticker: (sticker: string) => void,
}

export function ChatController({
    onCameraPress,
    onGalleryPress,
    onSendPress,
    onChooseSticker,
}: ChatControllerProps): JSX.Element {
    const theme = useTheme<AppTheme>()

    const [visible, setVisible] = useState(false);
    const [visibleSticker, setVisibleSticker] = useState(false);
    const [willShowSticker, setWillShowSticker] = useState(false)
    const [willShowKeyboard, setWillShowKeyboard] = useState(false)
    const [messageText, setMessageText] = useState<string>("")

    const messageInputRef = useRef<TextInput>(null)

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const onStickerPress = () => {
        setWillShowSticker(true)
        messageInputRef.current?.blur()
        if (!Keyboard.isVisible()) 
            setVisibleSticker(true)

    }

    const onKeyboardPress = () => {
        setWillShowKeyboard(true)
        setVisibleSticker(false)
    }

    useFocusEffect(
        useCallback(() => {
            function onBackHandler() {
                messageInputRef.current?.blur()
                if (visibleSticker) {
                    setVisibleSticker(false)
                    
                    return true
                }
                return false
            }
            const backHandlerSubcription = BackHandler.addEventListener('hardwareBackPress', onBackHandler)

            return () => {
                backHandlerSubcription.remove()
            }
        }, [visibleSticker, messageInputRef])
    )

    useEffect(() => {

        function onKeyboardDidHide() {
            if (willShowSticker) {
                setVisibleSticker(true)
                setWillShowSticker(false)
            }


        }


        const didHideSubscription = Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);

        return () => {
            didHideSubscription.remove();
        };
    }, [willShowSticker]);

    return (
        <View
            style={{ flexDirection: 'column' }}>


            <View style={{ gap: 5, flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, alignItems: 'center', alignContent: 'center' }}>
                <View style={{
                    gap: 2,
                    flexDirection: 'row',
                    backgroundColor: theme.colors.elevation.level3,
                    borderRadius: 20,
                    // paddingHorizontal: 5,
                    // paddingVertical: 2,
                    flex: 1,
                }}>
                    <IconButton
                        onPress={visibleSticker ? onKeyboardPress : onStickerPress}
                        icon={visibleSticker ? "keyboard-outline" : "sticker-outline"}
                        animated
                    />
                    <TextInput
                        autoFocus={false}
                        onFocus={() => {
                            onKeyboardPress()
                        }}
                        ref={messageInputRef}
                        style={{
                            // borderWidth: 0.5,
                            fontSize: 16,
                            flex: 1,
                        }}
                        value={messageText}
                        placeholder="Nhập tin nhắn"
                        onChangeText={setMessageText}
                    ></TextInput>
                    <Menu
                        visible={visible}
                        onDismiss={closeMenu}
                        anchorPosition="top"
                        anchor={<IconButton onPress={openMenu} icon={'camera-outline'} />}>
                        <Menu.Item onPress={() => {
                            closeMenu()
                            onCameraPress()
                        }} leadingIcon={'camera'} title="Máy ảnh" />
                        <Menu.Item onPress={() => {
                            closeMenu()
                            onGalleryPress()
                        }} leadingIcon={'image'} title="Thư viện" />
                    </Menu>
                </View>

                <IconButton
                    icon={messageText.length > 0 ? "send-lock" : "plus"}
                    animated
                    iconColor={theme.colors.tertiary}
                    containerColor={theme.colors.tertiaryContainer}
                    size={28}
                    onPress={messageText.trim().length > 0 ? () => {
                        onSendPress(messageText)
                        setMessageText("")
                     } : () => ToastAndroid.show("Sắp ra mắt", ToastAndroid.SHORT)}
                />
                {/* <TextInput label={'Nhập tin nhắn'} mode="outlined"
                placeholder="Nhập tin nhắn"
                ref={messageInputRef}
                // autoFocus={true}
                value={message}
                style={{
                    flex: 1,
                    zIndex: 10,
                }}
                onChangeText={onChangeMessage}
                onFocus={() => {
                    setStickerVisible(false)
                }}
                right={(message.length > 0)
                    ?
                    <TextInput.Icon onPress={submitTextMessage} icon={'send'} color={() => theme.colors.primary} />
                    :
                    <TextInput.Icon onPress={() => ToastAndroid.show("Sắp ra mắt", ToastAndroid.SHORT)} icon={'paperclip'} color={() => theme.colors.primary} />
                    // <TextInput.Icon onPress={handleCamera} icon={'camera'} color={() => theme.colors.primary} />

                }
                left={<TextInput.Icon onPress={() => {
                    if (!stickerVisible == true)
                        messageInputRef.current?.blur()
                    setStickerVisible(!stickerVisible)
                }} icon={'sticker-emoji'} color={(isTextInputFocused) => theme.colors.primary} />}
            /> */}

                {/* { message.length > 0 && } */}
            </View>

            <StickerPicker visible={visibleSticker} listener={{
                onStickerWillHide() {

                },
                onStickerWillShow: () => {
                    // Keyboard.dismiss()
                },
                onStickerDidHide: () => {
                    if (willShowKeyboard) {
                        messageInputRef.current?.focus()
                        setWillShowKeyboard(false)
                    }

                },
                onStickerDidShow() {

                },
            }} 
                onStickerPress={onChooseSticker}
            />
        </View>
    )
}