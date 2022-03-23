import { calendar_v3, calendar } from '@googleapis/calendar';
import { GaxiosResponse } from 'googleapis-common';
import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../lib/apiResponses';
import { fetchFirstEventByCalendarEventId } from '../../../lib/db-access/event';
import { withSessionContext } from '../../../lib/sessionContext';
import { CalendarResult } from '../../../models/misc/CalendarResult';

const calendarClient = calendar({
    version: 'v3',
    auth: process.env.CALENDAR_API_KEY,
});

const mapCalendarResponse = (res: GaxiosResponse<calendar_v3.Schema$Events>): Promise<CalendarResult[] | null> => {
    if (!res.data.items) {
        return Promise.resolve(null);
    }

    return Promise.all(res.data.items
        .filter((x) => x.id)
        .map(async (x) => ({
            id: x.id as string,
            name: x.summary ?? undefined,
            description: x.description ?? undefined,
            link: x.htmlLink ?? undefined,
            location: x.location ?? undefined,
            creator: x.creator?.displayName ?? x.creator?.email ?? undefined,
            start: x.start?.dateTime ?? x.start?.date ?? undefined,
            end: x.end?.dateTime ?? x.start?.date ?? undefined,
            existingEventId: (await fetchFirstEventByCalendarEventId(x.id as string))?.id,
        })));
};

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        switch (req.method) {
            case 'GET':
                await calendarClient.events
                    .list({
                        calendarId: process.env.CALENDAR_ID,
                        timeMin: new Date().toISOString(),
                        maxResults: 50,
                        singleEvents: true,
                        orderBy: 'startTime',
                    })
                    .then(mapCalendarResponse)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
        return;
    },
);

export default handler;
