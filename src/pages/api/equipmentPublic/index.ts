import { NextApiRequest, NextApiResponse } from 'next';
import { fetchEquipmentsPublic } from '../../../lib/db-access';
import { respondWithCustomErrorMessage, respondWithEntityNotFoundResponse } from '../../../lib/apiResponses';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET':
            await fetchEquipmentsPublic()
                .then((result) => res.status(200).json(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            return;

        default:
            respondWithEntityNotFoundResponse(res);
    }

    return;
};

export default handler;
