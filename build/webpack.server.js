const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  // 指定了打包代码将适合在node环境中运行，确保Node.js内置模块不会被打包进去。
  target: 'node',
  // 应用程序的入口点
  entry: './src/server',
  output: {
    path: path.resolve(__dirname, '../dist/server'),
    filename: 'index.js',
  },
  mode: 'production',
  // 生成源码映射文件，这样才能支持断点调试ts源码
  devtool: 'source-map',
  resolve: {
    // 解析这些扩展名的文件
    extensions: ['.ts', '.js', '.tsx'],
  },

  module: {
    rules: [
      {
        test: /\.js$|ts$|tsx$/,
        use: {
          loader: 'babel-loader',
          options: {
            // 预设：分别用于转译ES6语法、ts、react
            presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
            // 支持ts装饰器的插件
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
            ],
          },
        },
        // babel-loader不会转译任何在node_modules目录中的js、ts、tsx文件。
        exclude: /node_modules/,
      },
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              modules: {
                // 该选项用于服务端渲染场景。支持css module，生成局部类名映射，可将className嵌入到html中，不生成包含 CSS 代码的js模块
                exportOnlyLocals: true,
                // className的命名格式
                localIdentName: '[folder]_[local]_[hash:base64:8]',
              },
            },
          },
        ],
      },
    ],
  },
  // 排除node_modules中的所有模块，不然所有依赖的第三方模块都会被打进bundle中，程序运行可不再需要node_modules目录
  externals: [nodeExternals()],
};
