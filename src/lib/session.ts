import type { SessionOptions, IronSession } from 'iron-session';
import { getIronSession } from 'iron-session';
import { NextApiRequest, NextApiResponse } from 'next';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { IncomingMessage, ServerResponse } from 'http';

export type SessionData = { user?: CurrentUserInfo };
export type Session = IronSession<SessionData>;

const options: SessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD || '',
    cookieName: 'backstage2',
    cookieOptions: { secure: process.env.NODE_ENV !== 'development', sameSite: 'strict' },
};

export const getSession = (
    req: IncomingMessage | NextApiRequest,
    res: ServerResponse | NextApiResponse,
): Promise<Session> => getIronSession<SessionData>(req, res, options);
