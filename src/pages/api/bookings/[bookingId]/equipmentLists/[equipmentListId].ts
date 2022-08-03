import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../../lib/apiResponses';
import {
    deleteEquipmentList,
    fetchEquipmentList,
    updateEquipmentList,
    validateEquipmentListObjectionModel,
} from '../../../../../lib/db-access';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import { Status } from '../../../../../models/enums/Status';
import {
    BookingChangelogEntryType,
    hasChanges,
    hasListChanges,
    logChangeToBooking,
    logRentalStatusChangeToBooking,
} from '../../../../../lib/changelogUtils';
import { EquipmentListObjectionModel } from '../../../../../models/objection-models/BookingObjectionModel';
import { fetchBookingWithEquipmentLists } from '../../../../../lib/db-access/booking';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);
        const equipmentListId = Number(req.query.equipmentListId);

        if (isNaN(bookingId) || isNaN(equipmentListId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = await fetchBookingWithEquipmentLists(bookingId);

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

                await logChangeToBooking(context.currentUser, bookingId, BookingChangelogEntryType.EQUIPMENTLIST);

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
                    .then(async (result) => {
                        const newList = req.body.equipmentList as EquipmentListObjectionModel;
                        const existingList = booking.equipmentLists?.find((l) => l.id === newList.id);

                        if (
                            !existingList ||
                            hasChanges(existingList, newList, ['rentalStatus']) ||
                            hasListChanges(existingList.equipmentListEntries, newList.equipmentListEntries)
                        ) {
                            await logChangeToBooking(
                                context.currentUser,
                                bookingId,
                                BookingChangelogEntryType.EQUIPMENTLIST,
                            );
                        }

                        // Check if the rental status has changed
                        if (newList.rentalStatus !== undefined && newList.rentalStatus !== existingList?.rentalStatus) {
                            await logRentalStatusChangeToBooking(
                                context.currentUser,
                                bookingId,
                                newList.name ?? existingList?.name,
                                newList.rentalStatus ?? null,
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
