import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../lib/apiResponses';
import { fetchBookings } from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';
import { BookingObjectionModel } from '../../../models/objection-models';
import { BookingType } from '../../../models/enums/BookingType';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const bookingType = req.query.bookingType === 'rental' ? BookingType.RENTAL : BookingType.GIG;

    switch (req.method) {
        case 'GET':
            await fetchBookings()
                .then((result) => calculateEquipmentForBookings(result, bookingType))
                .then((result) => res.status(200).json(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));
            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

const calculateEquipmentForBookings = (
    bookingsObjectionModels: BookingObjectionModel[],
    bookingType: BookingType,
): number[][] => {
    return bookingsObjectionModels
        .filter((booking) => booking.bookingType === bookingType)
        .map(getEquipmentIdsForBooking);
};

const getEquipmentIdsForBooking = (booking: BookingObjectionModel) => {
    const allEquipmentIds = booking.equipmentLists
        .flatMap((x) => [...x!.listEntries, ...x!.listHeadings.flatMap((lh) => lh.listEntries)])
        .filter((x) => x.equipment)
        .map((x) => x.equipment!.id);

    const uniqueEquipmentIds = [...new Set(allEquipmentIds)];

    return uniqueEquipmentIds;
};

export default handler;
