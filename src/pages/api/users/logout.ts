import { destroySessionCookie } from '../../../lib/authenticate';
import { withApiSession } from '../../../lib/session';

const handler = withApiSession((req, res) => {
    destroySessionCookie(req);
    res.status(200).json({ isLoggedIn: false });
});

export default handler;
