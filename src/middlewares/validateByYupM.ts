import { BadRequest } from '../errors';
import { AnySchema, ValidationError } from 'yup';
import { Middleware } from 'koa';

export const validateByYupM = <Schema extends AnySchema<any, any, any>, From extends 'body' | 'query'>(schema: Schema, from: From): ValidateYupMiddleware<Schema, any, From> => (ctx, next) => {
    return schema.validate(ctx.request[from], { abortEarly: false })
        .catch((details: ValidationError) => {
            const errorHash = details.inner.reduce(
                (acc, item) =>
                    Object.assign(acc, { [item.path || item.type || item.name]: item.message }),
                Object.create(null)
            );

            return Promise.reject(new BadRequest(Object.entries(errorHash).reduce((message, [field, error]) => {
                return `${(message ? message + '\n' : message)}Field "${field}" is invalid. Details: "${error}".`;
            }, '')));
        })
        .then(() => next());
};

type ExtractYupOut<T extends AnySchema<any, any, any>> = T['__outputType'];

export type ValidateYupMiddleware<T extends AnySchema<any, any, any>, State = {}, From extends 'body' | 'query' = 'body'> =
    Middleware<State, { request: { [Key in From]: ExtractYupOut<T> } }>
