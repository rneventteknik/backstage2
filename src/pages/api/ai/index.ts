import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../lib/apiResponses';
import { fetchBookings } from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';
import { BookingObjectionModel } from '../../../models/objection-models';
import { listContainsEquipment, onlyUniqueById } from '../../../lib/utils';
import { toBooking } from '../../../lib/mappers/booking';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            await fetchBookings()
                .then((result) => calculateMatrix(result))
                .then((result) => res.status(200).json(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));
            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

export interface ResultTypeForAi {
    matrix: (1 | 0)[][];
    equipmentIdToColumnMapping: Record<number, number>;
    columnToEquipmenIdMapping: Record<number, number>;
}

const calculateMatrix = (bookingsObjectionModels: BookingObjectionModel[]): ResultTypeForAi => {
    const bookings = bookingsObjectionModels.map(toBooking);
    // calculate a matrix with bookings as rows and equipment as columns
    const allEquipmentIds = bookings
        .flatMap((x) => x.equipmentLists)
        .flatMap((x) => [...x!.listEntries, ...x!.listHeadings.flatMap((lh) => lh.listEntries)])
        .filter((x) => x.equipment)
        .map((x) => x.equipment!)
        .filter(onlyUniqueById);

    // Equipment id => column number mapping
    const equipmentIdToColumnMapping: Record<number, number> = {};
    const columnToEquipmenIdMapping: Record<number, number> = {};
    allEquipmentIds.forEach((equipment, index) => {
        equipmentIdToColumnMapping[equipment.id] = index;
        columnToEquipmenIdMapping[index] = equipment.id;
    });

    const matrix = Array.from({ length: bookings.length }, () =>
        Array(Object.keys(equipmentIdToColumnMapping).length).fill(0),
    );

    bookings.forEach((booking, index) => {
        allEquipmentIds.forEach((equipment) => {
            const equipmentIndex = equipmentIdToColumnMapping[equipment.id];

            const isBooked = booking.equipmentLists!.some((list) => listContainsEquipment(list, equipment));
            matrix[index][equipmentIndex] = isBooked ? 1 : 0;
        });
    });

    return { matrix: matrix, equipmentIdToColumnMapping, columnToEquipmenIdMapping } as any;
};

export default handler;
