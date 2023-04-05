import { SafeAreaView, View } from "react-native";
import { Text } from "react-native-paper";
import { ContactProps } from "../..";

export default function Contact({ navigation}: ContactProps): JSX.Element {
    return (
        <SafeAreaView>
            <View>
                <Text>
                    Liên lạc
                </Text>
            </View>
        </SafeAreaView>
    )
}