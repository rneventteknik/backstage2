import { NextApiRequest, NextApiResponse } from 'next';
import { IronSession } from 'iron-session';
import { destroySessionCookie } from '../../../lib/authenticate';
import { withApiSession } from '../../../lib/session';

const handler = withApiSession((req: NextApiRequest & { session: IronSession }, res: NextApiResponse): void => {
    destroySessionCookie(req);
    res.status(200).json({ isLoggedIn: false });
});

export default handler;
