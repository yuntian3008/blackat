import { SafeAreaView, View } from "react-native";
import { Avatar, List, Text, TextInput } from "react-native-paper";
import { SearchProps } from "..";

export default function Search({ navigation }: SearchProps): JSX.Element {
    return (
        <SafeAreaView>
            <View style={{ gap: 5, flexDirection: 'column', alignItems: 'center', height: '100%', paddingHorizontal: 20, paddingVertical: 20 }}>
                <TextInput mode="outlined" style={{width: "100%"}} label="Tìm kiếm"/>
                <List.Item 
                    style={{width: "100%"}}
                    title="Nguyễn Văn A"
                    left={props => <Avatar.Image size={48} source={{ uri: "https://doodleipsum.com/700x700/avatar-3"}} />}
                />
            </View>
        </SafeAreaView>
    )
}