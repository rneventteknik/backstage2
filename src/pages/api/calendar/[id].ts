import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import { withSessionContext } from '../../../lib/sessionContext';
import { getCalendarEvent } from '../../../lib/calenderUtils';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const calendarEventId = req.query.id;

    if (!calendarEventId) {
        respondWithEntityNotFoundResponse(res);
        return;
    }

    switch (req.method) {
        case 'GET':
            await getCalendarEvent(calendarEventId.toString())
                .then((result) => res.status(200).json(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

export default handler;
