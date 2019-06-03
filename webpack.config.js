const path = require("path");
const webpack = require('webpack');

module.exports = {
  entry: {
        "avatar": "./client/avatar.js",
        "control": "./client/control",
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
      port: 9000
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
              presets: ['@babel/env'],
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
       }
      ]
  }
};
