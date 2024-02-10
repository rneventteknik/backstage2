import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../lib/apiResponses';
import { fetchEquipmentPublicCategories } from '../../../lib/db-access';
import {
    validateEquipmentPublicCategoryObjectionModel,
    insertEquipmentPublicCategory,
} from '../../../lib/db-access/equipmentPublicCategories';
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

                if (!req.body.equipmentPublicCategory) {
                    throw Error('Missing equipmentPublicCategory parameter');
                }

                if (!validateEquipmentPublicCategoryObjectionModel(req.body.equipmentPublicCategory)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertEquipmentPublicCategory(req.body.equipmentPublicCategory)
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            case 'GET':
                await fetchEquipmentPublicCategories()
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
