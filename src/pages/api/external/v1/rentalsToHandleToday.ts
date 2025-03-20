import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../../lib/apiResponses';
import { withApiKeyContext } from '../../../../lib/sessionContext';
import { fetchBookings } from '../../../../lib/db-access';
import { Status } from '../../../../models/enums/Status';
import { getEquipmentInDatetime, getEquipmentOutDatetime, HasDatetimes } from '../../../../lib/datetimeUtils';
import { toBooking } from '../../../../lib/mappers/booking';
import { EquipmentList } from '../../../../models/interfaces/EquipmentList';
import { reduceSumFn } from '../../../../lib/utils';
import { BookingObjectionModel } from '../../../../models/objection-models';
import { BookingType } from '../../../../models/enums/BookingType';

const isToday = (date: Date | undefined | null): boolean => {
    if (!date) {
        return false;
    }
    const today = new Date();

    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
};

const getRentalsToHandleTodayFromBookings = (
    result: BookingObjectionModel[],
    getDatetime: (equipmentList: HasDatetimes) => Date | null | undefined,
) => {
    return result
        .filter((booking) => booking.status !== Status.CANCELED)
        .filter((booking) => booking.bookingType === BookingType.RENTAL)
        .map(toBooking)
        .map((booking) => ({
            name: booking.name,
            ownerUser: booking.ownerUser?.name,
            link: getLinkToBooking(booking.id),
            equipmentLists: booking
                .equipmentLists!.filter((equipmentList) => isToday(getDatetime(equipmentList)))
                .map((x) => ({ name: x.name, numberOfEquipment: numberOfEquipment(x) })),
        }))
        .filter((x) => x.equipmentLists.length > 0);
};

const numberOfEquipment = (equipmentList: EquipmentList): number => {
    const allEquipmentEntries = [
        ...equipmentList.listEntries,
        ...equipmentList.listHeadings.flatMap((x) => x.listEntries ?? []),
    ];
    return allEquipmentEntries.map((x) => x.numberOfUnits).reduce(reduceSumFn);
};

const getLinkToBooking = (bookingId: number): string => (process.env.APPLICATION_BASE_URL + '/bookings/' + bookingId)

const handler = withApiKeyContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            await fetchBookings()
                .then((result) => {
                    const equipmentOutBookings = getRentalsToHandleTodayFromBookings(result, getEquipmentOutDatetime);

                    const equipmentInBookings = getRentalsToHandleTodayFromBookings(result, getEquipmentInDatetime);

                    return res.status(200).json({
                        equipmentInBookings,
                        equipmentOutBookings,
                    });
                })
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            return;

        default:
            respondWithInvalidMethodResponse(res);
    }
});

export default handler;
