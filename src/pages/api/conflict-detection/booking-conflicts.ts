import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidDataResponse } from '../../../lib/apiResponses';
import { fetchEquipmentConflictsForBooking } from '../../../lib/db-access/equipmentConflicts';
import { withSessionContext } from '../../../lib/sessionContext';
import { getValueOrFirst, toIntOrUndefined } from '../../../lib/utils';

// The conflict status of every equipment on every equipment list in a booking.
const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const bookingId = toIntOrUndefined(getValueOrFirst(req.query.bookingId));

    if (!bookingId) {
        respondWithInvalidDataResponse(res);
        return;
    }

    try {
        res.status(200).json(await fetchEquipmentConflictsForBooking(bookingId));
    } catch (error) {
        respondWithCustomErrorMessage(res, error instanceof Error ? error.message : 'Unknown error');
    }
});

export default handler;
