/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');

const MetroConfig = require('@ui-kitten/metro-config');

const evaConfig = {
  evaPackage: '@eva-design/eva',
  // Optional, but may be useful when using mapping customization feature.
  // customMappingPath: './custom-mapping.json',
};

const extraNodeModules = {
  'shared': path.resolve(__dirname + '/../shared'),
};
const watchFolders = [
  path.resolve(__dirname + '/../shared')
];

module.exports = MetroConfig.create(evaConfig, {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) =>
        //redirects dependencies referenced from common/ to local node_modules
        name in target ? target[name] : path.join(process.cwd(), `node_modules/${String(name)}`),
    }),
  },
  watchFolders,
});
