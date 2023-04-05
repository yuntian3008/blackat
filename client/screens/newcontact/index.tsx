import { SafeAreaView, View } from "react-native";
import { Avatar, List, Searchbar, Text, TextInput } from "react-native-paper";
import { NewContactProps } from "..";
import { useState } from "react";

export default function NewContact({ navigation }: NewContactProps): JSX.Element {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const onChangeSearch = (query: string) => setSearchQuery(query);
    return (
        <SafeAreaView>
            <View style={{ gap: 5, flexDirection: 'column', alignItems: 'center', height: '100%', paddingHorizontal: 20, paddingVertical: 20 }}>
                <Searchbar
                    placeholder="Nhập số điện thoại"
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                />
                <List.Item
                    onPress={() => console.log('test')}                
                    style={{ width: "100%" }}
                    title="+8412345676"
                    left={props => <Avatar.Image size={48} source={{ uri: "https://doodleipsum.com/700x700/avatar-3" }} />}
                />
            </View>
        </SafeAreaView>
    )
}