console.log('Loading babel.config.js...')

const workletsPluginOptions = {}

module.exports = function (api) {
  api.cache(true)

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      '@babel/plugin-transform-modules-commonjs',
      ['react-native-worklets/plugin', workletsPluginOptions],
      'react-native-reanimated/plugin',
    ],
  }
}
