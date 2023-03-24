
import { Dimensions, Image, Text, View } from "react-native";
import { Button } from "../../components/Button";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from "../../App";


type Props = NativeStackScreenProps<RootStackParamList, 'Introduce'>;


function Introduce({navigation} : Props): JSX.Element {
    const dimensions = Dimensions.get("window")

    return (
        <View className="flex flex-col h-screen items-center p-8 w-full">
            <Image style={{ width: dimensions.width * 0.9, height: dimensions.width * 0.9, resizeMode: 'contain' }} source={require('./introduce.png')}></Image>
            <Text className="text-3xl text-center text-slate-700">Trao thông điệp cho nhau ở bất cứ đâu mà không ai khác được biết, quả thực là một phép màu</Text>
            <Button
                android_ripple={{
                    color: '#000000',
                    borderless: true,
                }}
                onPress={() => {
                    navigation.navigate("Login")
                }}
                viewStyle="mt-auto w-full rounded-full"
                buttonStyle="bg-neutral-700"
                textStyle="text-center text-white text-md p-4 justify-center"
            >Tiếp tục</Button>
        </View>
    );
}

export default Introduce