
import { Dimensions, Image, PermissionsAndroid, SafeAreaView, View } from "react-native";
// import { Button } from "../../components/Button";
import { IntroduceProps } from "..";
import { Button, Text, useTheme } from "react-native-paper";
import { AppTheme } from "../../theme";
import PinCodeInput from "../../components/PinCodeInput";
import { useState } from "react";
import AppModule from "../../native/android/AppModule";

function Introduce({ navigation }: IntroduceProps): JSX.Element {
  const dimensions = Dimensions.get("window")


  const start = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      console.log(granted)
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
      const requirePin = await AppModule.requirePin()
      if (!requirePin) setVisiblePinCode(true)
      else navigation.navigate('Login')
    } catch (err) {
      console.warn(err);
    }
  };

  const theme = useTheme<AppTheme>()

  const [visiblePinCode, setVisiblePinCode] = useState<boolean>(false)
  const pinCodeSubmit = (pin: string) => {
    AppModule.setPin(pin).then((v) => {
      if (v) navigation.navigate('Login')
    })
  }

  return (
    <SafeAreaView>
      <PinCodeInput isNew visible={visiblePinCode} dismiss={() => setVisiblePinCode(false)} submit={pinCodeSubmit} />
        {/* UI kittin + style */}
            <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%', paddingHorizontal: 20, paddingVertical: 40 }}>
        {/* Style */}
        <Image style={{ width: dimensions.width * 0.9, height: dimensions.width * 0.9, resizeMode: 'contain' }} source={require('./introduce.png')}></Image>
        {/* Nativewind */}
        <Text variant="headlineLarge" style={{ textAlign: 'center', color: theme.colors.primary, fontWeight: 'bold' }}>Khám phá sự tin cậy</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }} variant="headlineLarge">Bảo vệ tin nhắn của bạn, từ đầu đến cuối</Text>
        <View style={{ flex: 1 }}></View>
        <Button mode="contained"
          style={{ width: '100%', borderRadius: 90 }}
          onPress={start}>
          Tiếp tục
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default Introduce