import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import { fetchBooking } from '../../../../../lib/db-access';
import { toBooking } from '../../../../../lib/mappers/booking';
import { Status } from '../../../../../models/enums/Status';
import { logChangeToBooking, BookingChangelogEntryType } from '../../../../../lib/changelogUtils';
import {
    insertEquipmentListEntry,
    validateEquipmentListEntryObjectionModel,
} from '../../../../../lib/db-access/equipmentListEntry';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);
        const equipmentListId = Number(req.query.equipmentListId);
        const equipmentListHeadingId = Number(req.query.equipmentListHeadingId);

        if (isNaN(bookingId) || (isNaN(equipmentListId) && isNaN(equipmentListHeadingId))) {
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

                if (!req.body.equipmentListEntry) {
                    throw Error('Missing equipmentListEntry parameter');
                }

                if (!validateEquipmentListEntryObjectionModel(req.body.equipmentListEntry, true)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertEquipmentListEntry(
                    req.body.equipmentListEntry,
                    isNaN(equipmentListId) ? undefined : equipmentListId,
                    isNaN(equipmentListHeadingId) ? undefined : equipmentListHeadingId,
                )
                    .then((result) => {
                        logChangeToBooking(
                            context.currentUser,
                            bookingId,
                            booking.name,
                            BookingChangelogEntryType.EQUIPMENTLIST,
                        ).then(() => res.status(200).json(result));
                    })
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }

        return;
    },
);

export default handler;
