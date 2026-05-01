module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This plugin is REQUIRED for the Sidebar to work
      'react-native-reanimated/plugin',
    ],
  };
};