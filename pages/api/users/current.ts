import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-iron-session';
import { CurrentUserInfo } from '../../../interfaces/auth/CurrentUserInfo';
import withSession from '../../../lib/session';

const handler = withSession((req: NextApiRequest & { session: Session }, res: NextApiResponse): void => {
    const user = req.session.get<CurrentUserInfo>('user');

    if (user) {
        res.json({
            ...user,
            isLoggedIn: true,
        });
    } else {
        res.json({
            isLoggedIn: false,
        });
    }
});

export default handler;
