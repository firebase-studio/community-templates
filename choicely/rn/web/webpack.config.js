console.log('Loading webpack.config.js...')

const path = require('node:path')

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const babelConfig = require('./babel.config')

const repoRoot = path.resolve(__dirname, '../..')
const rnRoot = path.resolve(__dirname, '..')
const webRoot = path.resolve(rnRoot, 'web')
const nodeModulesRoot = path.resolve(repoRoot, 'node_modules')

const { getPorts } = require('../dev/ports')
const { webPort } = getPorts(repoRoot)

const indexHtmlPath = path.resolve(webRoot, 'index.html')
const indexJsPath = path.resolve(webRoot, 'index.web.js')

const transpileModules = [
  'react-native-vector-icons',
  'react-native-toast-message',
  'react-native-reanimated',
  'react-native-gesture-handler',
]

const babelLoaderConfiguration = {
  test: /\.[jt]sx?$/,
  include: [
    webRoot,
    indexJsPath,
    path.resolve(rnRoot, 'src'),
    ...transpileModules.map((m) => path.resolve(nodeModulesRoot, m)),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: path.resolve(repoRoot, '.cache/babel-loader'),
      presets: ['module:@react-native/babel-preset'],
      plugins: ['react-native-web', ...(babelConfig.plugins || [])],
    },
  },
}

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/i,
  type: 'asset', // webpack 5-friendly; replaces url-loader/file-loader
}

const ttfLoaderConfiguration = {
  test: /\.ttf$/i,
  type: 'asset/resource',
}

const isWorkspace = Boolean(process.env.WORKSPACE_SLUG)

module.exports = {
  entry: { app: indexJsPath },
  output: {
    clean: true,
    path: path.resolve(repoRoot, 'dist'),
    filename: 'app.bundle.js',
  },
  resolve: {
    extensions: [
      '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
      '.tsx', '.ts', '.jsx', '.js', '.json',
    ],
    alias: {
      'react-native$': 'react-native-web',
      '../Utilities/Platform': 'react-native-web/dist/exports/Platform',
      '../../Utilities/Platform': 'react-native-web/dist/exports/Platform',
      './Platform': 'react-native-web/dist/exports/Platform',
    },
    fallback: {
      process: require.resolve('process/browser'),
    },
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      ttfLoaderConfiguration,
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: indexHtmlPath }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    }),
  ],
  devServer: {
    port: webPort,
    open: false,
    hot: true,
    compress: true,
    allowedHosts: 'all',
    ...(isWorkspace
      ? {
        client: {
          webSocketURL: {
            port: 443,
            pathname: '/ws',
          },
        },
        webSocketServer: 'ws',
      }
      : {}),
  },
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(repoRoot, '.cache/webpack'),
    name: 'webpack',
  },
}
