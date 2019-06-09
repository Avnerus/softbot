const path = require("path");
const webpack = require('webpack');

module.exports = {
  entry: {
        "avatar": "./client/avatar.js",
        "control": ["./client/control","webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000"],
        "admin": "./client/admin.js"
  },
  output: {
    path: path.resolve(__dirname, "public"),
    publicPath: '/',
    filename: "[name]-bundle.js",
  },
  mode: "development",
  devServer: {
      contentBase: path.join(__dirname, "public"),
      compress: true,
      port: 9000,
      hot: true
  },
  plugins: [
     new webpack.HotModuleReplacementPlugin()
  ],
  module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components|wasm)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/env', "@babel/preset-react"],
              plugins: ["@babel/plugin-transform-runtime"]
            }
          }
        },
       {
         test: /\.css$/,
         use: ['style-loader', 'css-loader']
       },
       {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
       },
       {
              test: /\.(svg|png|jpg)$/,
              use: {
                loader: 'file-loader',
                options: {
                  limit: 22000,
                  name: 'assets/[name]-[hash].[ext]'
                }
              }
          }
      ]
  }
};
