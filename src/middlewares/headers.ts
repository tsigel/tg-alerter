import { DefaultContext, DefaultState, Middleware } from 'koa';
import { equals } from 'ramda';
import { PermissionDenied } from '../errors';

export const setHeadersM: (headers: Record<string, string>) => Middleware =
    (headers: Record<string, string>) =>
        (ctx, next) => {
            Object.entries(headers).forEach(([name, value]) => ctx.set(name, value));
            return next();
        };

export type HeadersState<T extends string> = {
    s_headers: {
        [Key in T]: string
    }
} & DefaultState;

export const getHeadersM = <T extends string>(names: Array<T>): Middleware<HeadersState<T>, DefaultContext> =>
    (ctx, next) => {
        ctx.state.s_headers =
            names
                .reduce((acc, name: string) => Object.assign(acc, { [name]: ctx.get(name) }), Object.create(null));
        return next();
    };

export const checkRequiredHeader = (headers: Record<string, string | Array<String>>): Middleware =>
    (ctx, next) => {
        Object.entries(headers).forEach(([key, value]) => {
            const request_header = ctx.get(key);
            if (!request_header || !equals(value, request_header)) {
                throw new PermissionDenied(`Wrong header ${key}!`);
            }
        });
        return next();
    };
