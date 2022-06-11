import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidDataResponse } from '../../../lib/apiResponses';
import { fetchBookingsWithEquipmentInInterval } from '../../../lib/db-access/booking';
import { withSessionContext } from '../../../lib/sessionContext';
import { toDateOrUndefined, toIntOrUndefined } from '../../../lib/utils';

const handler = withSessionContext(async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const startDatetimeString = Array.isArray(_req.query.startDatetime)
        ? _req.query.startDatetime[0]
        : _req.query.startDatetime;
    const endDatetimeString = Array.isArray(_req.query.endDatetime)
        ? _req.query.endDatetime[0]
        : _req.query.endDatetime;
    const equipmentIdString = Array.isArray(_req.query.equipmentId)
        ? _req.query.equipmentId[0]
        : _req.query.equipmentId;
    const ignoreEquipmentListIdString = Array.isArray(_req.query.ignoreEquipmentListId)
        ? _req.query.ignoreEquipmentListId[0]
        : _req.query.ignoreEquipmentListId;

    const equipmentId = toIntOrUndefined(equipmentIdString);
    const startDatetime = toDateOrUndefined(startDatetimeString);
    const endDatetime = toDateOrUndefined(endDatetimeString);
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
