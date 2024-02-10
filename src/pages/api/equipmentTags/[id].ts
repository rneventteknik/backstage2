import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import {
    deleteEquipmentTag,
    fetchEquipmentTagWithEquipment,
    updateEquipmentTag,
    validateEquipmentTagObjectionModel,
} from '../../../lib/db-access/equipmentTag';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<Promise<void> | void> => {
        const equipmentTagId = Number(req.query.id);

        if (isNaN(equipmentTagId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchEquipmentTagWithEquipment(equipmentTagId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'DELETE':
                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                return deleteEquipmentTag(equipmentTagId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            case 'PUT':
                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateEquipmentTagObjectionModel(req.body.equipmentTag)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await updateEquipmentTag(equipmentTagId, req.body.equipmentTag)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;
        }
    },
);

export default handler;
