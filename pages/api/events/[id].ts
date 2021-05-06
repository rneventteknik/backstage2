import { NextApiRequest, NextApiResponse } from 'next';
import { fetchEvent } from '../../../lib/data-interfaces';

const handler = (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    return fetchEvent(Number(_req.query.id))
        .then((result) => res.status(200).json(result))
        .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));
};

export default handler;
