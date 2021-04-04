import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-iron-session';
import withSession from '../../../lib/session';

const handler = withSession((req: NextApiRequest & { session: Session }, res: NextApiResponse): void => {
    req.session.destroy();
    res.status(200).json({ isLoggedIn: false });
});

export default handler;
