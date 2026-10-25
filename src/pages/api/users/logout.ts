import { NextApiRequest, NextApiResponse } from 'next';
import { destroySessionCookie } from '../../../lib/authenticate';
import { getSession } from '../../../lib/session';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    destroySessionCookie(await getSession(req, res));
    res.status(200).json({ isLoggedIn: false });
};

export default handler;
