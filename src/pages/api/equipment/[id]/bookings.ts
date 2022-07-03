import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import { withSessionContext } from '../../../../lib/sessionContext';
import { fetchBookingsForEquipment } from '../../../../lib/db-access';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const equipmentId = Number(req.query.id);

    if (isNaN(equipmentId)) {
        respondWithEntityNotFoundResponse(res);
        return;
    }

    switch (req.method) {
        case 'GET':
            await fetchBookingsForEquipment(equipmentId)
                .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
});

export default handler;
