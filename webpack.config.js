let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const packageJsonObject = require('./package.json');
module.exports = {
  devServer: {
    contentBase: false,
    //我这里没有设置contentBase，个人研究contentBase必须指向存在的bundle.js文件所在目录，
    //因为这里是开发模式，所以dist目录并不存在，所以用false.
    host: 'localhost',
    port: '4201',
    inline: true, //webpack官方推荐
    watchOptions: {
      aggregateTimeout: 2000, //浏览器延迟多少秒更新
      poll: 1000 //每秒检查一次变动
    },
    compress: true, //一切服务都启用gzip 压缩
    historyApiFallback: true, //找不到页面默认跳index.html
    hot: true, //启动热更新，必须搭配new webpack.HotModuleReplacementPlugin()插件
    open: true
  },
  devtool: 'hidden-source-map',
  mode: 'development',
  entry: {
    'team-app': './src/team-app/index.ts',
    'personal-app': './src/personal-app/index.ts',
    bridge: './src/bridge/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './js/[name].bundle.js'
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
      },
      {
        test: /\.less$/,
        use: [{
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'less-loader'
        ]
      }
    ]
  },
  //插件配置
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/team-app/index.html', //原始文件
      filename: 'src/team-app/index.html', //编译后的文件名称
      hash: true, //hash
      title: '团队应用测试',
      chunksSortMode: 'manual',
      chunks: ['bridge', 'team-app'], // 按需引入对应名字的js文件
      inject: 'head',
      templateParameters: function (compilation, assets, options) {
        return {
          title: 'Document title',
          files: assets,
          options: options,
          webpackConfig: compilation.options,
          webpack: compilation.getStats().toJson()
        };
      }
    }),
    new HtmlWebpackPlugin({
      template: 'src/personal-app/index.html', //原始文件
      filename: 'src/personal-app/index.html', //编译后的文件名称
      hash: true, //hash
      title: '个人应用测试',
      chunksSortMode: 'manual',
      inject: 'head',
      chunks: ['bridge', 'personal-app'] // 按需引入对应名字的js文件
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyWebpackPlugin([{
      from: 'src/common/js/*',
      to: '../dist/src/common/js/[name].[ext]'
    }])
  ]
};