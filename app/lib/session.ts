import { withIronSession, Handler } from 'next-iron-session';

const withSession = (handler: Handler): ((...args: unknown[]) => Promise<unknown>) =>
    withIronSession(handler, {
        password: process.env.SECRET_COOKIE_PASSWORD || '',
        cookieName: 'backstage2',
        cookieOptions: { secure: false },
    });

export default withSession;
