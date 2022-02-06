import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-iron-session';
import { destroySessionCookie } from '../../../lib/authenticate';
import withSession from '../../../lib/session';

const handler = withSession((req: NextApiRequest & { session: Session }, res: NextApiResponse): void => {
    destroySessionCookie(req);
    res.status(200).json({ isLoggedIn: false });
});

export default handler;
