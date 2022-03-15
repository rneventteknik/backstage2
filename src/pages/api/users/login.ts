import { NextApiRequest, NextApiResponse } from 'next';
import { IronSession } from 'iron-session';
import { setSessionCookie, authenticate } from '../../../lib/authenticate';
import { withApiSession } from '../../../lib/session';

const handler = withApiSession(
    async (req: NextApiRequest & { session: IronSession }, res: NextApiResponse): Promise<void> => {
        const requestBody: { username: string; password: string } = await req.body;
        const username = requestBody.username;
        const password = requestBody.password;

        if (!username || !password) {
            res.status(403).json({ statusCode: 403, message: 'Missing login' });
            return;
        }
        const authUser = await authenticate(username, password);
        if (authUser) {
            await setSessionCookie(req, authUser).then((user) => res.status(200).json(user));
        } else {
            res.status(403).json({ statusCode: 403, message: 'Invalid login' });
        }
    },
);

export default handler;
