const path = require('path');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  // 确保Webpack知道在浏览器环境中运行，默认就是web，因此可以忽略
  target: 'web',
  // 设置构建模式为开发模式
  mode: 'production',
  // 客户端的入口文件
  entry: {
    main: './src/client/index.tsx',
  },
  // 输出配置
  output: {
    path: path.resolve(__dirname, '../dist/client'),
    filename: 'js/[name].[chunkhash:8].js',
    publicPath: '/',
  },
  // 解析配置
  resolve: {
    // 添加 '.ts' 和 '.tsx' 作为可解析扩展
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  // 配置source map以便调试。可以在浏览器的开发者工具中查看和调试原始源代码。
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$|ts$|tsx$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                // 支持css module，className局部化类名的命名格式
                localIdentName: '[folder]_[local]_[hash:base64:8]',
              },
            },
          },
          'sass-loader',
        ],
      },
      // .css文件为纯css，没有用到css module
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  optimization: {
    // 布尔值，production模式下，默认为 true，Webpack会默认使用内置的压缩插件（TerserPlugin）来压缩js，但不会压缩css。
    minimize: true,
    // 数组，允许你自定义和配置压缩插件。
    minimizer: [
      '...',
      // css的压缩插件
      new CssMinimizerPlugin(),
    ],
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      chunks: 'all',
      minChunks: 1,
      cacheGroups: {
        vendors: false,
        vendor_react: {
          test: module => /[\\/]node_modules[\\/](react|react-dom)[\\/]/.test(module.resource),
          name: 'vendor_react',
          chunks: 'all',
          priority: 100,
        },
        default: {
          name: 'vendor_common',
          chunks: 'all',
          priority: 10,
        },
      },
    },
  },
  // 配置插件
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/head_[name].[contenthash:8].css',
      chunkFilename: 'css/head_[name].[contenthash:8].css',
    }),
    new AssetsPlugin({
      path: path.resolve(__dirname, '../dist/client/'),
      filename: 'assets.json',
    }),
  ],
};
