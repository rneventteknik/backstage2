import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import {
    deleteEquipmentPackage,
    fetchEquipmentPackage,
    updateEquipmentPackage,
    validateEquipmentPackageObjectionModel,
} from '../../../lib/db-access';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const equipmentPackageId = Number(req.query.id);

        if (isNaN(equipmentPackageId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchEquipmentPackage(equipmentPackageId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'DELETE':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                await deleteEquipmentPackage(equipmentPackageId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'PUT':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateEquipmentPackageObjectionModel(req.body.equipmentPackage)) {
                    res.status(500).json({ statusCode: 500, message: 'Invalid equipment package' });
                    return;
                }

                await updateEquipmentPackage(equipmentPackageId, req.body.equipmentPackage)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
