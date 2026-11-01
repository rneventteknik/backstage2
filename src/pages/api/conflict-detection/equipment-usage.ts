import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidDataResponse } from '../../../lib/apiResponses';
import { toDatetimeOrUndefined } from '../../../lib/datetimeUtils';
import { fetchEquipmentUsage } from '../../../lib/db-access/equipmentConflicts';
import { withSessionContext } from '../../../lib/sessionContext';
import { getValueOrFirst, toIntOrUndefined } from '../../../lib/utils';

// The bookings using an equipment during a period, and the most units they use at the same time.
const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const equipmentId = toIntOrUndefined(getValueOrFirst(req.query.equipmentId));
    const startDatetime = toDatetimeOrUndefined(getValueOrFirst(req.query.startDatetime));
    const endDatetime = toDatetimeOrUndefined(getValueOrFirst(req.query.endDatetime));

    if (!equipmentId || !startDatetime || !endDatetime) {
        respondWithInvalidDataResponse(res);
        return;
    }

    try {
        res.status(200).json(await fetchEquipmentUsage(equipmentId, startDatetime, endDatetime));
    } catch (error) {
        respondWithCustomErrorMessage(res, error instanceof Error ? error.message : 'Unknown error');
    }
});

export default handler;
