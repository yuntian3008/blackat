import { Layout } from "@ui-kitten/components";
import { SafeAreaView, Text } from "react-native";
import { HomeProps } from "..";

function Home({ navigation }: HomeProps): JSX.Element {


    return (
        <SafeAreaView>
            {/* UI kittin + style */}
            <Layout style={{ gap: 5, flexDirection: 'column', alignItems: 'center', height: '100%', paddingHorizontal: 20, paddingVertical: 40 }}>
                <Text className="text-3xl self-start text-neutral-700">
                    HOME HERE
                </Text>
                
            </Layout>
        </SafeAreaView>
    )
}

export default Home