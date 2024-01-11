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

  const { key } = ctx.query;

  const result = await jsapiHandle(ctx);

  // 返回结果
  ctx.set('content-type', 'application/json; charset=utf-8');
  ctx.body = {
    info: `${key}, ${result}`,
  };
});

export default router;
