import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../lib/apiResponses';
import { fetchEquipments } from '../../../lib/db-access';
import { insertEquipment, validateEquipmentObjectionModel } from '../../../lib/db-access/equipment';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<Promise<void> | void> => {
        switch (req.method) {
            case 'POST':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

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
