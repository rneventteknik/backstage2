import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../lib/apiResponses';
import {
    deleteEquipment,
    fetchEquipment,
    updateEquipment,
    validateEquipmentObjectionModel,
} from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
        if (isNaN(Number(req.query.id))) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                return fetchEquipment(Number(req.query.id))
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            case 'DELETE':
                return deleteEquipment(Number(req.query.id))
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            case 'PUT':
                if (!validateEquipmentObjectionModel(req.body.equipment)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                // TODO Write to changelog here when it is implemented

                return updateEquipment(Number(req.query.id), req.body.equipment)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            default:
                respondWithEntityNotFoundResponse(res);
                return;
        }
    },
);

export default handler;
