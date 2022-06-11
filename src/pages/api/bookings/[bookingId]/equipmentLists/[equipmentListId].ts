import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../../lib/apiResponses';
import {
    deleteEquipmentList,
    fetchBooking,
    fetchEquipmentList,
    updateEquipmentList,
    validateEquipmentListObjectionModel,
} from '../../../../../lib/db-access';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import { toBooking } from '../../../../../lib/mappers/booking';
import { Status } from '../../../../../models/enums/Status';
import { BookingChangelogEntryType, logChangeToBooking } from '../../../../../lib/changelogUtils';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);
        const equipmentListId = Number(req.query.equipmentListId);

        if (isNaN(bookingId) || isNaN(equipmentListId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = await fetchBooking(bookingId).then(toBooking);

        switch (req.method) {
            case 'GET':
                await fetchEquipmentList(equipmentListId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'DELETE':
                if (
                    context.currentUser.role == Role.READONLY ||
                    (booking.status === Status.DONE && context.currentUser.role !== Role.ADMIN)
                ) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                await deleteEquipmentList(equipmentListId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'PUT':
                if (
                    context.currentUser.role == Role.READONLY ||
                    (booking.status === Status.DONE && context.currentUser.role !== Role.ADMIN)
                ) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateEquipmentListObjectionModel(req.body.equipmentList)) {
                    res.status(500).json({ statusCode: 500, message: 'Invalid equipment list' });
                    return;
                }

                await updateEquipmentList(equipmentListId, req.body.equipmentList)
                    .then((result) => {
                        logChangeToBooking(
                            context.currentUser,
                            bookingId,
                            BookingChangelogEntryType.EQUIPMENTLIST,
                        ).then(() => res.status(200).json(result));
                    })
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
