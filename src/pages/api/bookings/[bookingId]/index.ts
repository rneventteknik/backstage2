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
    logOwnerUserChangeToBooking,
    logPaymentStatusChangeToBooking,
    logRentalStatusChangeToBooking,
    logSalaryStatusChangeToBooking,
    logStatusChangeToBooking,
} from '../../../../lib/changelogUtils';
import { fetchUser } from '../../../../lib/db-access';
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
import { CurrentUserInfo } from '../../../../models/misc/CurrentUserInfo';
import {
    EquipmentListObjectionModel,
    IBookingObjectionModel,
} from '../../../../models/objection-models/BookingObjectionModel';

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
                        await logChangesToBooking(booking, req.body.booking, context.currentUser);

                        res.status(200).json(result);
                    })
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

const logChangesToBooking = async (
    booking: IBookingObjectionModel,
    newBooking: IBookingObjectionModel,
    currentUser: CurrentUserInfo,
) => {
    const bookingId = booking.id;

    // General changes
    if (hasChanges(booking, newBooking, ['status', 'salaryStatus', 'ownerUserId'])) {
        await logChangeToBooking(currentUser, bookingId, booking.name);
    }

    // Check for status changes
    const newStatus = booking.status !== newBooking.status ? newBooking.status : undefined;

    if (newStatus !== null && newStatus !== undefined) {
        await logStatusChangeToBooking(currentUser, bookingId, booking.name, newStatus);
    }

    // Check for salary changes
    const newSalaryStatus = booking.salaryStatus !== newBooking.salaryStatus ? newBooking.salaryStatus : undefined;

    if (newSalaryStatus !== undefined) {
        await logSalaryStatusChangeToBooking(currentUser, bookingId, booking.name, newSalaryStatus);
    }

    // Check for payment status changes
    const newPaymentStatus = booking.paymentStatus !== newBooking.paymentStatus ? newBooking.paymentStatus : undefined;

    if (newPaymentStatus !== null && newPaymentStatus !== undefined) {
        await logPaymentStatusChangeToBooking(currentUser, bookingId, booking.name, newPaymentStatus);
    }

    // Check for owner changes
    const newOwnerUserId = booking.ownerUser?.id !== newBooking.ownerUserId ? newBooking.ownerUserId : undefined;

    if (newOwnerUserId !== undefined) {
        const newOwnerUser = await fetchUser(newOwnerUserId);
        if (!newOwnerUser) {
            throw new Error('Invalid Owner User');
        }
        await logOwnerUserChangeToBooking(
            currentUser,
            bookingId,
            booking.name,
            booking.ownerUser?.name ?? null,
            newOwnerUser?.name,
        );
    }

    // Check for equipment lists changes
    if (
        newBooking.equipmentLists &&
        hasListChanges(booking.equipmentLists, newBooking.equipmentLists, ['rentalStatus'])
    ) {
        logChangeToBooking(currentUser, bookingId, booking.name, BookingChangelogEntryType.EQUIPMENTLIST);
    }

    // Check for equipment-list rental status changes
    if (newBooking.equipmentLists) {
        const newEquipmentLists = newBooking.equipmentLists as EquipmentListObjectionModel[];
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
                currentUser,
                bookingId,
                booking.name,
                list.name ?? getExistingEquipmentListWithId(list.id)?.name,
                list.rentalStatus ?? null,
            ),
        );
    }
};

export default handler;
