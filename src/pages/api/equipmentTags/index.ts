import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../lib/apiResponses';
import {
    fetchEquipmentTags,
    insertEquipmentTag,
    validateEquipmentTagObjectionModel,
} from '../../../lib/db-access/equipmentTag';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<Promise<void> | void> => {
        switch (req.method) {
            case 'POST':
                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!req.body.equipmentTag) {
                    throw Error('Missing equipmentTag parameter');
                }

                if (!validateEquipmentTagObjectionModel(req.body.equipmentTag)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertEquipmentTag(req.body.equipmentTag)
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            case 'GET':
                await fetchEquipmentTags()
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
