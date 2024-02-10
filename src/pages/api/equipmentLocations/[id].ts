import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../lib/apiResponses';
import {
    deleteEquipmentLocation,
    validateEquipmentLocationObjectionModel,
    updateEquipmentLocation,
    fetchEquipmentLocation,
} from '../../../lib/db-access/equipmentLocations';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<Promise<void> | void> => {
        const EquipmentLocationId = Number(req.query.id);

        if (isNaN(EquipmentLocationId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchEquipmentLocation(EquipmentLocationId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'DELETE':
                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                return deleteEquipmentLocation(EquipmentLocationId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            case 'PUT':
                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateEquipmentLocationObjectionModel(req.body.equipmentLocation)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await updateEquipmentLocation(EquipmentLocationId, req.body.equipmentLocation)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;
        }
    },
);

export default handler;
