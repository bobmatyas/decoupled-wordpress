var path = require("path");

module.exports = {
  entry: ["./src/App.js"],
  output: {
    filename: "bundle.min.js",
    path: path.resolve(__dirname, "dist")
  },
  devtool: "cheap-eval-source-map",
  devServer: {
    port: 9000,
    contentBase: path.join(__dirname, "dist"),
    https: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"]
            }
          }
        ]
      }
    ]
  }
};
