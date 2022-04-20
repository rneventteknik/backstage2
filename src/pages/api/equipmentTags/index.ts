import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithEntityNotFoundResponse } from '../../../lib/apiResponses';
import { fetchEquipmentTags } from '../../../lib/db-access/equipmentTag';
import { withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
    switch (req.method) {
        case 'GET':
            await fetchEquipmentTags()
                .then((result) => res.status(200).json(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            return;

        default:
            respondWithEntityNotFoundResponse(res);
    }

    return;
});

export default handler;
