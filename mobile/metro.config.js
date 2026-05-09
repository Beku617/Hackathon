const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-safe-area-context': path.resolve(__dirname, 'node_modules/react-native-safe-area-context'),
};

module.exports = config;
