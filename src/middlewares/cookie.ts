import { Middleware } from 'koa';
import { parse, serialize } from 'cookie';
import { mergeDeepRight, mergeRight, pick } from 'ramda';

export type CookieSchema = {
    'Authorization': string;
}

export const setCookieM = <Key extends keyof CookieSchema>(name: Key, value: CookieSchema[Key]): Middleware => (ctx, next) => {
    ctx.res.setHeader('Set-Cookie', serialize(name, value, {
        httpOnly: true
    }));
    return next();
};

export const getCookieM = <K extends keyof CookieSchema>(names: Array<K>): Middleware<CookieState<K>> =>
    (ctx, next) => {
        ctx.state = mergeDeepRight(
            ctx.state, {
                cookie: pick(names, parse(ctx.req.headers.cookie ?? '')) as any
            })
        return next();
    };

export type CookieState<T extends keyof CookieSchema> = {
    cookie?: {
        [Key in T]: CookieSchema[Key]
    }
}
