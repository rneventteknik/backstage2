import { NextApiRequest, NextApiResponse } from 'next';
import { fetchEvents } from '../../../lib/data-interfaces';

const handler = (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    return fetchEvents()
        .then((result) => res.status(200).json(result))
        .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));
};

export default handler;
