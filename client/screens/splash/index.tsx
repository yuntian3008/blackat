import { Alert, Image, Text, View } from "react-native";
import Svg, { SvgCssUri, SvgFromUri } from "react-native-svg";
import Logo from "../../components/Logo";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "../../theme";

type Props = {
    onAnimationFinished: () => void
}

function Splash({ onAnimationFinished }: Props): JSX.Element {
    const theme = useTheme<AppTheme>()
    return (
        <View style={{
            flexDirection: 'row',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background
        }}>
            <View style={{
                backgroundColor: 'white',
                borderRadius: 20,
            }}>
                <Logo onFinish={({ finished }) => {
                    if (finished)
                        onAnimationFinished()
                    // navigation.popToTop()
                }} />
            </View>

        </View>
    )
}

export default Splash