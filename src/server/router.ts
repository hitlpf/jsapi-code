import Router from 'koa-router';
const path = require('path');
const fs = require('fs'); 

import renderSSR from './render';

import jsapiHandle from './jsapi-handle';

// 文件前缀
const filePrefix = '../../../jsapi-data';

const router = new Router();

router.get('/', async (ctx, next) => {
  await next();

  await renderSSR(ctx);
});

router.get('/jsapi_ppvn_define_map', function(ctx, next){
  const file = path.resolve(__dirname, `${filePrefix}/jsapi_ppvn_define_map.txt`);
  let jsapiLinesCurrent = fs.readFileSync(file, "utf-8");
  ctx.body = jsapiLinesCurrent;
});

router.get('/getInfo', async (ctx, next) => {
  await next();

  let key: any = '';
  let result = '';

  try {
    ({ key } = ctx.query);
    result = await jsapiHandle(ctx);
  } catch (error) {
    console.log(error);
  }

  // 返回结果
  ctx.set('content-type', 'application/json; charset=utf-8');
  ctx.body = {
    info: result,
  };
});

export default router;
