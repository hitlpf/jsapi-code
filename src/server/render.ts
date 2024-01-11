import React from 'react';
import { renderToString } from 'react-dom/server';
import { Context } from 'koa';
// import { renderToPipeableStream } from 'react-dom/server';

import assetsUtil from '../util/read-assets';
import { logger, sleep } from '../util/common';

import App from '../views';

export default async function (ctx: Context) {
  ctx.set({
    Pragma: 'No-cache',
    'Cache-Control': 'no-cache',
    Expires: '0',
    'content-type': 'text/html; charset=utf-8',
  });
  ctx.status = 200;

  const { manifestJs, mainJs, mainCss, vendorReactJs, vendorCommonJs } = assetsUtil.getAssets();

  // 先将第一片传到浏览器
  ctx.res.write(`
    <html>
      <head>
        <title>react ssr</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="${mainCss}" />
        <script src="${manifestJs}"></script>
        <script src="${vendorCommonJs}"></script>
        <script src="${vendorReactJs}"></script>
      </head>
      <body>
  `);

  // 模拟延时1秒
  await sleep(1000);

  const data = { name: 'jsapi' };

  const appHtml: string = renderToString(React.createElement(App, data));
  logger(appHtml);

  ctx.res.write(`
        <div id="root">${appHtml}</div>
        <script>
          // 所以这里要获取下存在服务端的数据并作为初始值存到 window 中
          // 数据脱水
          window.data = ${JSON.stringify(data)};
        </script>
        <script src="${mainJs}"></script>
      </body>
    </html>`);

  ctx.res.end(null);
}
