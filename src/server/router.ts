import Router from 'koa-router';

import renderSSR from './render';

import jsapiHandle from './jsapi-handle';

const router = new Router();

router.get('/', async (ctx, next) => {
  await next();

  await renderSSR(ctx);
});

router.get('/getInfo', async (ctx, next) => {
  await next();

  let key: any = '';
  let result = '';
  console.log('ctx------');
  console.log(ctx);

  try {
    ({ key } = ctx.query);
    result = await jsapiHandle(ctx);
  } catch (error) {
    console.log(error);
  }

  // 返回结果
  ctx.set('content-type', 'application/json; charset=utf-8');
  ctx.body = {
    info: `${key}, ${result}`,
  };
});

export default router;
