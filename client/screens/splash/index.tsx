import { Alert, Image, Text, View } from "react-native";
import Svg, { SvgCssUri, SvgFromUri } from "react-native-svg";
import Logo from "../../components/Logo";
import { SplashProps } from "..";

type Props = {
    onAnimationFinished: () => void
}

function Splash({ onAnimationFinished }: Props): JSX.Element {
    return (
        <View className="flex flex-row h-screen justify-center items-center">
            <Logo onFinish={({ finished }) => {
                if (finished)
                    onAnimationFinished()
                    // navigation.popToTop()
            }} />
        </View>
    )
}

export default Splash