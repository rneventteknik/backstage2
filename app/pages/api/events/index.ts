import { NextApiRequest, NextApiResponse } from 'next';
import executeProcedure from '../../../lib/database';
import eventMap from '../../../lib/database-mappers/event';

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
    return executeProcedure('eventProcedure', eventMap, [])
        .then((result) => res.status(200).json(result))
        .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));
};

export default handler;
