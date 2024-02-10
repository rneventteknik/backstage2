import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../lib/apiResponses';
import {
    deleteEquipmentPublicCategory,
    fetchEquipmentPublicCategory,
    updateEquipmentPublicCategory,
    validateEquipmentPublicCategoryObjectionModel,
} from '../../../lib/db-access/equipmentPublicCategories';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<Promise<void> | void> => {
        const EquipmentPublicCategoryId = Number(req.query.id);

        if (isNaN(EquipmentPublicCategoryId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchEquipmentPublicCategory(EquipmentPublicCategoryId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'DELETE':
                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                return deleteEquipmentPublicCategory(EquipmentPublicCategoryId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            case 'PUT':
                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateEquipmentPublicCategoryObjectionModel(req.body.equipmentPublicCategory)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await updateEquipmentPublicCategory(EquipmentPublicCategoryId, req.body.equipmentPublicCategory)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;
        }
    },
);

export default handler;
