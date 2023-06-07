import { DefaultContext, Middleware } from 'koa';
import { HeadersState } from './middlewares/headers';

export type TgTokenHeader = 'Tg-Token';

export type MiddlewareWithToken = Middleware<HeadersState<TgTokenHeader>, DefaultContext>;
