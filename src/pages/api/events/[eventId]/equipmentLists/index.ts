import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../../../lib/apiResponses';
import {
    fetchEquipmentListsForEvent,
    insertEquipmentList,
    validateEquipmentListObjectionModel,
} from '../../../../../lib/db-access/equipmentList';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const eventId = Number(req.query.eventId);

        if (isNaN(eventId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'POST':
                if (!req.body.equipmentList) {
                    throw Error('Missing equipmentList parameter');
                }

                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateEquipmentListObjectionModel(req.body.equipmentList)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertEquipmentList(req.body.equipmentList, eventId)
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            case 'GET':
                await fetchEquipmentListsForEvent(eventId)
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
