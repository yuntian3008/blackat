import { Spinner } from "@ui-kitten/components";
import { View } from "react-native";
import Logo from "./Logo";
import { Text } from "react-native-paper";

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
            backgroundColor: "#F5FCFF88",
        }}>
            <Logo isLoop />
        </View>
    )
}