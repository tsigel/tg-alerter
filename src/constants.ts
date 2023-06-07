import { getRequiredNumProp, getRequiredProp } from '@tsigel/getenvprop';
import TelegramBot from 'node-telegram-bot-api';

export const PORT = getRequiredNumProp('SERVER_PORT');
