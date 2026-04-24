module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@dwwp': './src',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
