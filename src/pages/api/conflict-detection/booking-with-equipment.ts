import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidDataResponse } from '../../../lib/apiResponses';
import { toDatetimeOrUndefined } from '../../../lib/datetimeUtils';
import { fetchBookingsWithEquipmentInInterval } from '../../../lib/db-access/booking';
import { withSessionContext } from '../../../lib/sessionContext';
import { getValueOrFirst, toIntOrUndefined } from '../../../lib/utils';

const handler = withSessionContext(async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const startDatetimeString = getValueOrFirst(_req.query.startDatetime);
    const endDatetimeString = getValueOrFirst(_req.query.endDatetime);
    const equipmentIdString = getValueOrFirst(_req.query.equipmentId);
    const ignoreEquipmentListIdString = getValueOrFirst(_req.query.ignoreEquipmentListId);

    const equipmentId = toIntOrUndefined(equipmentIdString);
    const startDatetime = toDatetimeOrUndefined(startDatetimeString);
    const endDatetime = toDatetimeOrUndefined(endDatetimeString);
    const ignoreEquipmentListId = toIntOrUndefined(ignoreEquipmentListIdString);

    if (!equipmentId) {
        respondWithInvalidDataResponse(res);
        return;
    }

    try {
        const result = await fetchBookingsWithEquipmentInInterval(
            equipmentId,
            startDatetime,
            endDatetime,
            ignoreEquipmentListId,
        );

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            respondWithCustomErrorMessage(res, error.message);
        } else {
            respondWithCustomErrorMessage(res, 'Unknown error');
        }
    }
});

export default handler;
