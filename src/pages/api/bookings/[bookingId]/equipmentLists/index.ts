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
import { fetchBooking } from '../../../../../lib/db-access';
import { toBooking } from '../../../../../lib/mappers/booking';
import { Status } from '../../../../../models/enums/Status';
import { logChangeToBooking, BookingChangelogEntryType } from '../../../../../lib/changelogUtils';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);

        if (isNaN(bookingId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = await fetchBooking(bookingId).then(toBooking);

        switch (req.method) {
            case 'POST':
                if (
                    context.currentUser.role == Role.READONLY ||
                    (booking.status === Status.DONE && context.currentUser.role !== Role.ADMIN)
                ) {
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
                    .then((result) => {
                        logChangeToBooking(
                            context.currentUser,
                            bookingId,
                            BookingChangelogEntryType.EQUIPMENTLIST,
                        ).then(() => res.status(200).json(result));
                    })
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
