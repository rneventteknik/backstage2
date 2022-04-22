import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../../../lib/apiResponses';
import {
    fetchEquipmentListsForBooking,
    insertEquipmentList,
    validateEquipmentListObjectionModel,
} from '../../../../../lib/db-access/equipmentList';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);

        if (isNaN(bookingId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'POST':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!req.body.equipmentList) {
                    throw Error('Missing equipmentList parameter');
                }

                if (!validateEquipmentListObjectionModel(req.body.equipmentList)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertEquipmentList(req.body.equipmentList, bookingId)
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            case 'GET':
                await fetchEquipmentListsForBooking(bookingId)
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
