import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithInvalidMethodResponse } from '../../lib/apiResponses';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET':
            res.status(200).json({ status: 'UP' });

            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
};

export default handler;
