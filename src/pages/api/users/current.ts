import { NextApiRequest, NextApiResponse } from 'next';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext((_req: NextApiRequest, res: NextApiResponse, context: SessionContext): void =>
    res.json(context.currentUser),
);

export default handler;
