import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-iron-session';
import { CurrentUserInfo } from '../../../interfaces/auth/CurrentUserInfo';
import authenticate from '../../../lib/authenticate';
import withSession from '../../../lib/session';

const handler = withSession(
    async (req: NextApiRequest & { session: Session }, res: NextApiResponse): Promise<void> => {
        const requestBody: { username: string; password: string } = await req.body;
        const username = requestBody.username;
        const password = requestBody.password;

        if (!username || !password) {
            res.status(403).json({ statusCode: 403, message: 'Missing login' });
            return;
        }
        const authUser = await authenticate(username, password);
        if (authUser) {
            const user: CurrentUserInfo = {
                isLoggedIn: true,
                username: authUser.username,
                name: authUser.user?.name,
                role: authUser.user?.role,
            };

            req.session.set('user', user);
            await req.session.save();
            res.status(200).json(user);
        } else {
            res.status(403).json({ statusCode: 403, message: 'Invalid login' });
        }
    },
);

export default handler;
