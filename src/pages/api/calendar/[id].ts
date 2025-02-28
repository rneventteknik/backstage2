import { calendar } from '@googleapis/calendar';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import { withSessionContext } from '../../../lib/sessionContext';
import { mapCalendarEvent } from '../../../lib/calenderUtils';

const calendarClient = calendar({
    version: 'v3',
    auth: process.env.CALENDAR_API_KEY,
});

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const calendarEventId = req.query.id;

    if (!calendarEventId) {
        respondWithEntityNotFoundResponse(res);
        return;
    }

    switch (req.method) {
        case 'GET':
            await calendarClient.events
                .get({
                    calendarId: process.env.CALENDAR_ID,
                    eventId: calendarEventId.toString(),
                })
                .then((result) => mapCalendarEvent(result.data))
                .then((result) => res.status(200).json(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

export default handler;
