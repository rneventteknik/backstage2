import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import {
    BookingChangelogEntryType,
    hasChanges,
    hasListChanges,
    logBookingDeletion,
    logChangeToBooking,
    logPaymentStatusChangeToBooking,
    logRentalStatusChangeToBooking,
    logStatusChangeToBooking,
} from '../../../../lib/changelogUtils';
import {
    deleteBooking,
    validateBookingObjectionModel,
    updateBooking,
    fetchBookingWithUser,
    fetchBookingWithEquipmentLists,
} from '../../../../lib/db-access/booking';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';
import { Role } from '../../../../models/enums/Role';
import { Status } from '../../../../models/enums/Status';
import { EquipmentListObjectionModel } from '../../../../models/objection-models/BookingObjectionModel';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);

        if (isNaN(bookingId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = await fetchBookingWithEquipmentLists(bookingId);

        switch (req.method) {
            case 'GET':
                await fetchBookingWithUser(bookingId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            case 'DELETE':
                if (
                    context.currentUser.role == Role.READONLY ||
                    (booking.status === Status.DONE && context.currentUser.role !== Role.ADMIN)
                ) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                await deleteBooking(bookingId)
                    .then((result) => {
                        logBookingDeletion(context.currentUser, booking.id, booking.name);
                        res.status(200).json(result);
                    })
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            case 'PUT':
                if (
                    context.currentUser.role == Role.READONLY ||
                    (booking.status === Status.DONE && context.currentUser.role !== Role.ADMIN)
                ) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateBookingObjectionModel(req.body.booking)) {
                    respondWithCustomErrorMessage(res, 'Invalid booking');
                    return;
                }

                await updateBooking(bookingId, req.body.booking)
                    .then(async (result) => {
                        if (hasChanges(booking, req.body.booking, ['status', 'paymentStatus'])) {
                            await logChangeToBooking(context.currentUser, bookingId, booking.name);
                        }

                        const newStatus =
                            booking.status !== req.body.booking.status ? req.body.booking.status : undefined;

                        if (newStatus !== null && newStatus !== undefined) {
                            await logStatusChangeToBooking(context.currentUser, bookingId, booking.name, newStatus);
                        }

                        const newPaymentStatus =
                            booking.paymentStatus !== req.body.booking.paymentStatus
                                ? req.body.booking.paymentStatus
                                : undefined;

                        if (newPaymentStatus !== null && newPaymentStatus !== undefined) {
                            await logPaymentStatusChangeToBooking(
                                context.currentUser,
                                bookingId,
                                booking.name,
                                newPaymentStatus,
                            );
                        }

                        // Special case: If the equipment lists are modified as a child to the booking, log that as well
                        if (
                            req.body.booking.equipmentLists &&
                            hasListChanges(booking.equipmentLists, req.body.booking.equipmentLists, ['rentalStatus'])
                        ) {
                            logChangeToBooking(
                                context.currentUser,
                                bookingId,
                                booking.name,
                                BookingChangelogEntryType.EQUIPMENTLIST,
                            );
                        }

                        // Check for rental status changes
                        if (req.body.booking.equipmentLists) {
                            const newEquipmentLists = req.body.booking.equipmentLists as EquipmentListObjectionModel[];
                            const getExistingEquipmentListWithId = (id: number) => {
                                return booking.equipmentLists?.find((l) => l.id === id);
                            };

                            const listsWithRentalStatusChanges = newEquipmentLists.filter(
                                (list) =>
                                    list.rentalStatus !== undefined &&
                                    list.rentalStatus !== getExistingEquipmentListWithId(list.id)?.rentalStatus,
                            );

                            listsWithRentalStatusChanges.forEach((list) =>
                                logRentalStatusChangeToBooking(
                                    context.currentUser,
                                    bookingId,
                                    booking.name,
                                    list.name ?? getExistingEquipmentListWithId(list.id)?.name,
                                    list.rentalStatus ?? null,
                                ),
                            );
                        }

                        res.status(200).json(result);
                    })
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
