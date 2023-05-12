import { Notification } from "@notifee/react-native";
import { messaging } from "firebase-admin"


export const sendNotificationMessage = async (tokens: Array<string>, data: {
  [key: string]: string;
}) => {
  
    // Send a message to devices with the registered tokens
    await messaging().sendMulticast({
      tokens,
      data: {
        ...data
      },
      android: {
        priority: 'high',
      }
    });
  }