import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { StackScreenProps } from "@react-navigation/stack";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { RootHomeTabParamList } from "./home";

export type IntroduceProps = StackScreenProps<RootStackParamList, 'Introduce'>;

export type LoginProps = StackScreenProps<RootStackParamList, 'Login'>;
    export type VerifyOtpCodeProps = StackScreenProps<RootStackParamList, 'VerifyOtpCode'>;


export type HomeProps = StackScreenProps<RootStackParamList, 'Home'>;
    export type ConversationProps = MaterialTopTabScreenProps<RootHomeTabParamList, 'Conversation'>;
    export type ContactProps = MaterialTopTabScreenProps<RootHomeTabParamList, 'Contact'>;

export type SearchProps = StackScreenProps<RootStackParamList, 'Search'>;
export type PartnerProps = StackScreenProps<RootStackParamList, 'Partner'>;

export type NewContactProps = StackScreenProps<RootStackParamList, 'NewContact'>;
export type ChatZoneProps = StackScreenProps<RootStackParamList, 'ChatZone'>;

export type ImageViewProps = StackScreenProps<RootStackParamList, 'ImageView'>;
export type QrscannerProps = StackScreenProps<RootStackParamList, 'Qrscanner'>;

export type SettingProps = StackScreenProps<RootStackParamList, 'Setting'>;
export type AccountProps = StackScreenProps<RootStackParamList, 'Account'>;
export type ProfileProps = StackScreenProps<RootStackParamList, 'Profile'>;

export type ChatSettingProps = StackScreenProps<RootStackParamList, 'ChatSetting'>;