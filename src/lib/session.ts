import { IronSessionOptions } from 'iron-session';
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
import { GetServerSidePropsContext, GetServerSidePropsResult, NextApiHandler } from 'next';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';

declare module 'iron-session' {
    interface IronSessionData {
        user?: CurrentUserInfo;
    }
}

const options: IronSessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD || '',
    cookieName: 'backstage2',
    cookieOptions: { secure: process.env.NODE_ENV !== 'development', sameSite: 'strict' },
};

export const withApiSession = (handler: NextApiHandler): NextApiHandler => {
    return withIronSessionApiRoute(handler, options);
};

export const withSsrSession = <T extends { [key: string]: unknown }>(
    handler: (context: GetServerSidePropsContext) => GetServerSidePropsResult<T> | Promise<GetServerSidePropsResult<T>>,
) => {
    return withIronSessionSsr(handler, options);
};

export { options };
