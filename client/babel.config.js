module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    "nativewind/babel",
    [
      'react-native-reanimated/plugin',
      {
        globals: ['__scanCodes'],
      },
    ]
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};
