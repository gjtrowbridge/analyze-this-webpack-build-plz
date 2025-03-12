/**
 * Able to set this up in typescript by following the instructions here:
 * https://webpack.js.org/configuration/configuration-languages/#typescript
 */
import path from 'path'
import webpack from 'webpack'
// Necessary to allow devServer on the Configuration object
import * as webpackDevServer from 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'


const config: webpack.Configuration = {
  entry: {
    index: './client/index.tsx',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
        sideEffects: true
      },
      {
        test: /\.tsx?$/,
        use: [
          'ts-loader'
        ]
      },
    ],
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"]
    }
  },
  // optimization: {
  //     usedExports: true,
  // },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/client'),
    publicPath: "/"
  },
  plugins: [
    new HtmlWebpackPlugin(),
  ],
  // resolve: {
  //     extensions: ['.ts']
  // },
  resolveLoader: {
    modules: ['node_modules'],
    extensions: ['.js', '.ts']
  },
  stats: 'verbose',
  target: 'web',

  devServer: {
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:8080',
      },
    ],
    hot: true,
    port: 9000,
  },
};

export default config