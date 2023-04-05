
import { Dimensions, Image, SafeAreaView, Text, View } from "react-native";
// import { Button } from "../../components/Button";
import { IntroduceProps } from "..";
import { Button } from "react-native-paper";

function Introduce({ navigation }: IntroduceProps): JSX.Element {
    const dimensions = Dimensions.get("window")

    return (
        <SafeAreaView>
            {/* UI kittin + style */}
            <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%', paddingHorizontal: 20, paddingVertical: 40 }}>
                {/* Style */}
                <Image style={{ width: dimensions.width * 0.9, height: dimensions.width * 0.9, resizeMode: 'contain' }} source={require('./introduce.png')}></Image>
                {/* Nativewind */}
                <Text className="text-3xl text-center text-slate-700">Trao thông điệp cho nhau ở bất cứ đâu mà không ai khác được biết, quả thực là một phép màu</Text>
                {/* UI kittin + style */}
                <Button mode="contained"
                    style={{ marginTop: 'auto', width: '100%', borderRadius: 90 }}
                    onPress={() => {
                        navigation.navigate('Login')
                    }}>
                    Tiếp tục
                </Button>
            </View>
        </SafeAreaView>
    );
}

export default Introduce