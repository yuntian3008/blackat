import { Spinner } from "@ui-kitten/components";
import { View } from "react-native";
import Logo from "./Logo";
import { Text, useTheme } from "react-native-paper";
import { AppTheme } from "../theme";

export const LoadingIndicator = (props: any) =>
    <View style={[props.style, {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }]}>
        { props.label && <Text>{props.label}</Text>}
        <Spinner size='small' status="basic" />
    </View>

export const LoadingOverlay = (): JSX.Element => {
    const theme = useTheme<AppTheme>()
    return (
        <View style={{
            position: 'absolute',
            zIndex: 1,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.background
        }}>
            <Logo isLoop />
        </View>
    )
}