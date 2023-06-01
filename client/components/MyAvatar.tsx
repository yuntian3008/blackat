import { StyleProp, TouchableNativeFeedback, View, ViewStyle } from "react-native"
import { Avatar, useTheme } from "react-native-paper"
import { AppTheme } from "../theme"


export interface MyAvatarProps {
    size?: number,
    image?: string,
    style?: StyleProp<ViewStyle>,
    onPress?: () => void
}

export function MyAvatar({
    size,
    image,
    style,
    onPress
}: MyAvatarProps): JSX.Element {
    const theme = useTheme<AppTheme>()
    return (
        <View style={{
            borderRadius: 50,
            overflow: 'hidden'
        }}>
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple(theme.colors.primaryContainer, true)}
                onPress={onPress}
            >
                {
                    image !== undefined && image !== null ?
                        <Avatar.Image
                            style={style ?? {
                                backgroundColor: theme.colors.infoContainer,
                            }}
                            size={size}
                            source={{
                                uri: image
                            }} /> :
                        <Avatar.Icon
                            style={style ?? {
                                backgroundColor: theme.colors.infoContainer
                            }}
                            color={theme.colors.info}
                            size={size}
                            icon={'account'} />
                }
            </TouchableNativeFeedback>
        </View>

    )
}