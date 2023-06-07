import TelegramBot from 'node-telegram-bot-api';
import { Middleware } from 'koa';
import { MiddlewareWithToken } from '../types';
import { boolean, number, object, string } from 'yup';
import { validateByYupM, ValidateYupMiddleware } from '../middlewares/validateByYupM';
import { BadRequest } from '../errors';
import { error, info } from '@tsigel/logger';

const sendMessageSchema = object().shape({
    chatId: number().required(),
    text: string().required(),
    options: object({
        parse_mode: string().oneOf(['Markdown', 'MarkdownV2', 'HTML']),
        disable_web_page_preview: boolean()
    })
});

type ValidMiddleware = ValidateYupMiddleware<typeof sendMessageSchema>;

type MergeMiddleware<State extends Middleware<any, any>, Context extends Middleware<any, any>> =
    State extends Middleware<infer A>
        ? Context extends Middleware<any, infer B>
            ? Middleware<A, B>
            : never
        : never;

const send: MergeMiddleware<MiddlewareWithToken, ValidMiddleware> = (ctx, next) => {
    const token = ctx.state.s_headers['Tg-Token'];
    if (!token || typeof token !== 'string') {
        error(`Has no Tg-Token header!`);
        throw new BadRequest('Wrong "Tg-Token" header!');
    }
    const tg = new TelegramBot(token);

    info(`Send message:`, ctx.request.body.chatId, ctx.request.body.text);

    return tg.sendMessage(ctx.request.body.chatId, ctx.request.body.text, ctx.request.body.options)
        .then((data) => {
            ctx.body = data;
            return next();
        });
};

export const sendMessageM = [
    validateByYupM(sendMessageSchema, 'body'),
    send
];
