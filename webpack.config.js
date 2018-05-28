const path = require("path");

module.exports = {
  entry: "./client/avatar.js",
  output: {
    path: path.resolve(__dirname, "public/avatar"),
    filename: "bundle.js",
  },
  mode: "development"
};
