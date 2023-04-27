
import { Dimensions, Image, SafeAreaView, Text, View } from "react-native";
// import { Button } from "../../components/Button";
import { ImageViewProps } from "..";
import { ImageZoom } from '@likashefqet/react-native-image-zoom';


function ImageView({ navigation, route }: ImageViewProps): JSX.Element {
    const dimensions = Dimensions.get("window")

    return (
        <ImageZoom uri={route.params.uri} containerStyle={{ backgroundColor:'black', width: '100%', height: '100%' }} imageContainerStyle={{ width: '100%', height: '100%' }} />
    );
}

export default ImageView