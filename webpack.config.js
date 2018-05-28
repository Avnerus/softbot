const path = require("path");

module.exports = {
  entry: {
        "avatar": "./client/avatar.js",
        "control": "./client/control.js",
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name]-bundle.js",
  },
  mode: "development",
  devServer: {
      contentBase: path.join(__dirname, "public"),
      compress: true,
      port: 9000
  }
};
