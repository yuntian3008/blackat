import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

export type IntroduceProps = NativeStackScreenProps<RootStackParamList, 'Introduce'>;
export type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type SplashProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;