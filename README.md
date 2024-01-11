## 简介
本项目支持React+SSR+TS，客户端和服务端(Node.js)都支持TS，都是使用webpack进行代码转译。

### 服务端打包
```
npm run server:dev
```

### 客户端打包
```
npm run client:dev
```
### 双端一起打包
```
npm run dev
```

## 启动
```
npm run start
```

## 重点介绍
### 1. 服务端和客户端如何转译TS和React的
都是使用webpack的babel-loader的presets预设来转译：
```
{
  test: /\.js$|ts$|tsx$/,
  use: {
    loader: 'babel-loader',
    options: {
      // 预设：分别用于转译ES6语法、TS、React
      presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
    }
  },
  // babel-loader不会转译任何在node_modules目录中的js、ts、tsx文件。
  exclude: /node_modules/,
},
```
### 2. 服务端的TS代码支持断点调试
(1) 配置.vscode/launch.json
```
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Webpack Output",
      "program": "${workspaceFolder}/dist/server/index.js",
      // "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "smartStep": true,
      "internalConsoleOptions": "openOnSessionStart"
    }
  ]
}
```
(2) webpack.server.js设置
```
devtool: 'source-map',
```
### 3. SSR服务端打包如何处理css module
css-loader即可支持css module，服务端只生成局部类名嵌入到html中，客户端会生成css文件，css中的类名和服务端生成的一致。
服务端打包配置代码：
```
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
  ]
},
```
### 4. postcss-modules和css-loader都能处理css module，该如何选择
在大多数情况下，开发者会选择 css-loader 来处理 CSS Modules，因为它简单、直接，并且易于配置。如果你需要额外的 CSS 处理能力，比如自动添加浏览器前缀、使用 CSS 下一代特性等。
你可以将 postcss-loader 与 css-loader 结合使用，但使用 postcss-loader 来调用 postcss-modules 插件处理 CSS Modules 的情况较少。
### 5. tsc和webpack都能转译TS代码，有啥区别
tsc 是一个专门为 TypeScript 设计的编译器，它可以执行类型检查并转译 TypeScript 代码。
Webpack 是一个模块打包工具，它可以处理项目中的模块依赖，并通过加载器（ts-loader或babel-loader）转译 TypeScript 代码。

### 6. babel-loader如何支持TS的装饰器
使用插件@babel/plugin-proposal-decorators和@babel/plugin-proposal-class-properties：
```
{
  test: /\.js$|ts$|tsx$/,
  use: {
    loader: 'babel-loader',
    options: {
      // 预设：分别用于转译ES6语法、ts、react
      presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
      // 支持ts装饰器的插件
      plugins: [
        ['@babel/plugin-proposal-decorators', { 'legacy': true }],
        ['@babel/plugin-proposal-class-properties', { 'loose': true }]
      ]
    }
  },
  // babel-loader不会转译任何在node_modules目录中的js、ts、tsx文件。
  exclude: /node_modules/,
}
```

### 7. 使用@babel/preset-typescript来转译TS代码，还需要tsconfig.json文件吗
使用 @babel/preset-typescript 来转译 TypeScript 代码，如果你只关心代码转译而不进行类型检查，那么技术上你不需要 tsconfig.json 文件。
但是tsconfig.json 文件仍然是推荐的，因为它用于配置类型检查和编辑器（VSCode）支持，包括代码高亮、自动完成、跳转到定义等功能。这些工具依赖于 tsconfig.json 来正确理解项目结构和编译选项。

### 8. SSR的renderToString两种写法
```
const appHtml: string = renderToString(React.createElement(App, data));
```

```
const appHtml: string = renderToString(<App name={data.name}/>);
```
第二种<App/>的写法，只能在.tsx文件中用，.ts文件只能用第一种写法
