const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver for @firebase/auth which is nested inside firebase package
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@firebase/auth': path.resolve(__dirname, 'node_modules/firebase/node_modules/@firebase/auth'),
};

module.exports = withNativeWind(config, { input: './global.css' })