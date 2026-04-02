import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import { Status } from '../../../../../models/enums/Status';
import { BookingChangelogEntryType, logChangeToBooking } from '../../../../../lib/changelogUtils';
import { fetchBookingWithEquipmentLists } from '../../../../../lib/db-access/booking';
import { toBooking } from '../../../../../lib/mappers/booking';
import { computePriceSummary } from '../../../../../lib/pricingUtils';
import {
    deleteEquipmentListHeading,
    fetchEquipmentListHeading,
    updateEquipmentListHeading,
    validateEquipmentListHeadingObjectionModel,
} from '../../../../../lib/db-access/equipmentListHeading';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);
        const equipmentListHeadingId = Number(req.query.equipmentListHeadingId);

        if (isNaN(bookingId) || isNaN(equipmentListHeadingId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = await fetchBookingWithEquipmentLists(bookingId);

        if (
            !booking.equipmentLists.some((list) =>
                list.listHeadings.some((heading) => heading.id === equipmentListHeadingId),
            )
        ) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchEquipmentListHeading(equipmentListHeadingId)
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

                const priceSnapshotForDelete = computePriceSummary(toBooking(booking));
                await logChangeToBooking(
                    context.currentUser,
                    bookingId,
                    booking.name,
                    BookingChangelogEntryType.EQUIPMENTLIST,
                    priceSnapshotForDelete,
                );

                await deleteEquipmentListHeading(equipmentListHeadingId)
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

                if (!validateEquipmentListHeadingObjectionModel(req.body.equipmentListHeading)) {
                    res.status(500).json({ statusCode: 500, message: 'Invalid equipment list heading' });
                    return;
                }

                await updateEquipmentListHeading(equipmentListHeadingId, req.body.equipmentListHeading)
                    .then(async (result) => {
                        const fullBooking = await fetchBookingWithEquipmentLists(bookingId).then(toBooking);
                        const priceSnapshot = computePriceSummary(fullBooking);
                        await logChangeToBooking(
                            context.currentUser,
                            bookingId,
                            booking.name,
                            BookingChangelogEntryType.EQUIPMENTLIST,
                            priceSnapshot,
                        );

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
