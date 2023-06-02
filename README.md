# Blackat - End-to-End Encryption Messaging System

![Blackat Logo](https://raw.githubusercontent.com/thiensgith/blackat/main/client/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png)

Blackat is a secure messaging application built using React Native, MongoDB, Socket.io, and Material 3. The app provides end-to-end encryption using the Signal Protocol, ensuring that your messages and calls are private and secure. Blackat is designed for the Android platform.

## Features

- Secure messaging: Blackat uses the Signal Protocol to encrypt your messages, ensuring end-to-end encryption and protecting your privacy.
  - Text Messaging: Send and receive text messages securely within the app. Communicate with your contacts using end-to-end encryption to protect the privacy of your conversations.
  - Image Sharing: Share images securely with your contacts. Blackat allows you to send and receive images while ensuring the confidentiality and integrity of the shared content.
  - Sticker Labels: Express yourself using sticker labels in your messages. Blackat offers a collection of fun and expressive sticker labels that you can use to add a personal touch to your conversations.
- Offline messaging: Blackat allows you to send and receive messages even when you are offline. Messages will be delivered as soon as you regain connectivity.
- Profile Creation: Users can create their personal profiles by providing relevant information such as their name and profile picture. This allows other users to identify and connect with them.
- Personal information is only shared with established contacts and exchanged through an end-to-end encrypted channel.

## Installation

### Clone the repository:
```
git clone https://github.com/thiensgith/blackat.git
```

### Server deployment:
1. Install the required dependencies:
```
cd server && npm install
```
2. Create ```.env``` file. Ex: ```.env.example``` file
```
MONGODB_SERVER=<YOUR MONGODB DATABASE URI>
```
3. Start server in debug mode
```
npm run dev
```

### Android Installtion:
Follow these steps to install and run Blackat on your Android device:

1. Install the required dependencies:
```
cd client && npm install
```
2. Create ```.env``` file. Ex: ```.env.example``` file
```
SOCKET_SERVER=<YOUR SERVER URI>
```
3. Connect your Android device and enable USB debugging.
4. Run the app on your device:
```
npm run android
```

## Technologies Used

- React Native: A JavaScript framework for building cross-platform mobile applications.
- MongoDB: A NoSQL database used for storing user data securely.
- Socket.io: A library for real-time, bidirectional communication between clients and servers.
- Material 3: A design system developed by Google, providing beautiful and consistent UI components.

## License

This project is licensed under the [MIT License](LICENSE).

---

We hope you enjoy using Blackat! Feel free to reach out to our support team if you have any questions or feedback.
