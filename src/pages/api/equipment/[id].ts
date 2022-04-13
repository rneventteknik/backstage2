import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
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
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<Promise<void> | void> => {
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
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                return deleteEquipment(Number(req.query.id))
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            case 'PUT':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                
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
