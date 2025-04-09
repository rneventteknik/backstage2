import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import { Status } from '../../../../../models/enums/Status';
import { BookingChangelogEntryType, hasChanges, logChangeToBooking } from '../../../../../lib/changelogUtils';
import { fetchBookingWithEquipmentLists } from '../../../../../lib/db-access/booking';
import {
    deleteEquipmentListEntry,
    fetchEquipmentListEntry,
    updateEquipmentListEntry,
    validateEquipmentListEntryObjectionModel,
} from '../../../../../lib/db-access/equipmentListEntry';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);
        const equipmentListEntryId = Number(req.query.equipmentListEntryId);

        if (isNaN(bookingId) || isNaN(equipmentListEntryId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = await fetchBookingWithEquipmentLists(bookingId);
        const oldEquipmentListEntry = booking.equipmentLists
            .flatMap((list) => [...list.listEntries, ...list.listHeadings.flatMap((x) => x.listEntries ?? [])])
            .find((entry) => entry.id === equipmentListEntryId);

        if (!oldEquipmentListEntry) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchEquipmentListEntry(equipmentListEntryId)
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

                await logChangeToBooking(
                    context.currentUser,
                    bookingId,
                    booking.name,
                    BookingChangelogEntryType.EQUIPMENTLIST,
                );

                await deleteEquipmentListEntry(equipmentListEntryId)
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

                if (!validateEquipmentListEntryObjectionModel(req.body.equipmentListEntry)) {
                    res.status(500).json({ statusCode: 500, message: 'Invalid equipment list entry' });
                    return;
                }

                await updateEquipmentListEntry(equipmentListEntryId, req.body.equipmentListEntry)
                    .then(async (result) => {
                        if (hasChanges(oldEquipmentListEntry, req.body.equipmentListEntry, ['isPacked'])) {
                            await logChangeToBooking(
                                context.currentUser,
                                bookingId,
                                booking.name,
                                BookingChangelogEntryType.EQUIPMENTLIST,
                            );
                        }

                        res.status(200).json(result);
                    })
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
