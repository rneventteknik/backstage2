import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import { fetchEquipmentPackages } from '../../../lib/db-access';
import {
    insertEquipmentPackage,
    validateEquipmentPackageObjectionModel,
} from '../../../lib/db-access/equipmentPackage';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        switch (req.method) {
            case 'POST':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!req.body.equipmentPackage) {
                    throw Error('Missing equipmentPackage parameter');
                }

                if (!validateEquipmentPackageObjectionModel(req.body.equipmentPackage)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertEquipmentPackage(req.body.equipmentPackage)
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            case 'GET':
                await fetchEquipmentPackages()
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }

        return;
    },
);

export default handler;
