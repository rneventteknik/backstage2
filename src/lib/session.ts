import type { SessionOptions, IronSession } from 'iron-session';
import { getIronSession } from 'iron-session';
import { GetServerSidePropsContext, GetServerSidePropsResult, NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { IncomingMessage, ServerResponse } from 'http';

export type SessionData = { user?: CurrentUserInfo };
export type RequestWithSession = { session: IronSession<SessionData> };

declare module 'iron-session' {
    interface IronSessionData {
        user?: CurrentUserInfo;
    }
}

const options: SessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD || '',
    cookieName: 'backstage2',
    cookieOptions: { secure: process.env.NODE_ENV !== 'development', sameSite: 'strict' },
};

export const getSession = (req: IncomingMessage | NextApiRequest, res: ServerResponse | NextApiResponse) => {
    return getIronSession<SessionData>(req, res, options);
};

export const withApiSession = (handler: (req: NextApiRequest & RequestWithSession, res: NextApiResponse) => void | Promise<void>): NextApiHandler => {
    return async (req, res) => {
        const session = await getSession(req, res);
        Object.assign(req, { session });
        return handler(req as NextApiRequest & RequestWithSession, res);
    };
};

export const withSsrSession = <T extends { [key: string]: unknown }>(
    handler: (context: GetServerSidePropsContext) => GetServerSidePropsResult<T> | Promise<GetServerSidePropsResult<T>>,
) => {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
        const session = await getSession(context.req, context.res);
        Object.assign(context.req, { session });
        return handler(context);
    };
};

export { options };
