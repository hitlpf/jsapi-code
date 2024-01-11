import Koa from 'koa';
import koaStatic from 'koa-static';
import path from 'path';

import { logger } from '../util/common';

import router from './router';

const app = new Koa();

app.use(router.routes()).use(router.allowedMethods());

// __dirname为服务端编译后的代码的目录dist
app.use(koaStatic(path.join(__dirname, '../client'), { maxage: 0 }));

const port = 3000;
app.listen(port, () => {
  logger(`Server running on http://localhost:${port}`);
});
