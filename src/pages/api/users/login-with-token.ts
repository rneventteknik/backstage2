import { setSessionCookie, authenticateWithLoginToken } from '../../../lib/authenticate';
import { withApiSession } from '../../../lib/session';

const handler = withApiSession(async (req, res) => {
    const { sealedToken }: { sealedToken: string } = await req.body;

    if (!sealedToken) {
        res.status(403).json({ statusCode: 403, message: 'Missing token' });
        return;
    }
    const authUser = await authenticateWithLoginToken(sealedToken, req.socket.remoteAddress ?? '');
    if (authUser) {
        await setSessionCookie(req, authUser).then((user) => res.status(200).json(user));
    } else {
        res.status(403).json({ statusCode: 403, message: 'Invalid login' });
    }
});

export default handler;
