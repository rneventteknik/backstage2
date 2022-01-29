import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../lib/apiResponses';
import { fetchEquipments } from '../../../lib/db-access';
import { insertEquipment, validateEquipmentObjectionModel } from '../../../lib/db-access/equipment';
import { withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
        switch (req.method) {
            case 'POST':
                if (!req.body.equipment) {
                    throw Error('Missing equipment parameter');
                }

                if (!validateEquipmentObjectionModel(req.body.equipment)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertEquipment(req.body.equipment)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                return;

            case 'GET':
                await fetchEquipments()
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                return;

            default:
                respondWithEntityNotFoundResponse(res);
        }

        return;
    },
);

export default handler;
