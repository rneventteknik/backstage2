import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-iron-session';
import withSession from '../../../lib/session';

const handler = withSession((req: NextApiRequest & { session: Session }, res: NextApiResponse): void => {
    const user = req.session.get('user');

    if (user) {
        res.json({
            isLoggedIn: true,
            ...user,
        });
    } else {
        res.json({
            isLoggedIn: false,
        });
    }
});

export default handler;
