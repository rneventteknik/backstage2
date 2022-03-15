import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
import { NextApiHandler } from 'next';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';

declare module "iron-session" {
    interface IronSessionData {
        user?: CurrentUserInfo
    }
}

const options = {
    password: process.env.SECRET_COOKIE_PASSWORD || '',
    cookieName: 'backstage2',
    cookieOptions: { secure: false },
}

const withApiSession = (handler: NextApiHandler): NextApiHandler =>
    withIronSessionApiRoute(handler, options);

const withSsrSession = (handler: any): any =>
    withIronSessionSsr(handler, options)

export {withApiSession, withSsrSession};
