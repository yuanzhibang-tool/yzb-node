let path = require('path');
module.exports = {
  devtool: 'hidden-source-map',
  mode: 'production',
  entry: {
    bridge: './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './[name].js'
  },
  resolve: {
    // Add '.ts' and '.tsx' as a resolvable extension.
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      }
    ]
  },
  //插件配置
  plugins: [
  ]
};