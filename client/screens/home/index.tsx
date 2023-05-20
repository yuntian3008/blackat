import { HomeProps } from "..";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Conversation from "./conversation";
import Contact from "./contact";
import { useEffect } from "react";
import { FAB, IconButton } from "react-native-paper";
import { Alert, NativeEventEmitter, NativeModules, SafeAreaView, View } from "react-native";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import Header, { HeaderItems, HeaderProps, MenuItems } from "../../components/Header";


export type RootHomeTabParamList = {
    Conversation: undefined,
    Contact: undefined,
};

const Tab = createMaterialTopTabNavigator<RootHomeTabParamList>()

function Home({ navigation, route }: HomeProps): JSX.Element {


    return (
        <Tab.Navigator screenOptions={{
            tabBarLabelStyle: { textTransform: 'none' },
        }}>
            <Tab.Screen name="Conversation" component={Conversation} options={{
                title: "Cuộc trò chuyện"
            }} />
            {/* <Tab.Screen name="Contact" component={Contact} options={{
                title: "Liên hệ"
            }} /> */}
        </Tab.Navigator>

    )
}

export default Home