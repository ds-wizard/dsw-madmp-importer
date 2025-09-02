const path = require('path')
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin({
        patterns: [
          { from: "public" },
        ],
    }),
  ],
}
