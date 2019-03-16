const path = require("path");

module.exports = {
  entry: {
        "avatar": "./client/avatar.js",
        "control": "./client/control.js",
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
  module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components|wasm)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/env'],
              plugins: ["@babel/plugin-transform-runtime", "@babel/plugin-syntax-dynamic-import"]
            }
          }
        }
      ]
  }
};
