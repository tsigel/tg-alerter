import Koa, { Middleware } from 'koa';
import Router from 'koa-router';
import { PORT } from './constants';
import { applyErrorM } from './errors';
import koaBody from 'koa-body';
import { getHeadersM, setHeadersM } from './middlewares/headers';
import { sendMessageM } from './methods/sendMessageM';
import { info } from '@tsigel/logger';


const app = new Koa();
const router = new Router();

router
    .use(getHeadersM(['Tg-Token' as const]))
    .post('/sendMessage', ...sendMessageM as Array<Middleware>);

app
    .use(setHeadersM({
        'Content-Type': 'application/json'
    }))
    .use(applyErrorM)
    .use(koaBody({ json: true }))
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(PORT);

info(`Listen port ${PORT}`);
