import { PressableProps, View } from "react-native"
import { Avatar, Badge, List, Text, TouchableRipple, useTheme } from "react-native-paper"

type EmptyItemProps = {
    message: string
}

export default function EmptyItem({message} : EmptyItemProps): JSX.Element {
    return (
        <Text
        variant="labelLarge"
        style={{
            width: "100%",
            padding: 20,
            textAlign: 'center'
        }}
        >{message}</Text>
    )
}