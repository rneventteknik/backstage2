import { calendar_v3, calendar } from '@googleapis/calendar';
import { GaxiosResponse } from 'googleapis-common';
import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../lib/apiResponses';
import { fetchSettings } from '../../../lib/db-access/setting';
import { withSessionContext } from '../../../lib/sessionContext';
import { getGlobalSetting } from '../../../lib/utils';
import { CalendarResult } from '../../../models/misc/CalendarResult';

const calendarClient = calendar({
    version: 'v3',
    auth: process.env.CALENDAR_API_KEY,
});

const filterCalendarEvents = async (events: CalendarResult[] | null) => {
    if (!events) {
        return null;
    }

    const globalSettings = await fetchSettings();
    const keywordWhiteList: string[] = JSON.parse(
        getGlobalSetting('googleCalendar.openHoursWhitelist', globalSettings, '[]'),
    );

    const filter = (event: CalendarResult) => {
        if (
            keywordWhiteList &&
            keywordWhiteList.length > 0 &&
            keywordWhiteList.some((keyword) => event.name?.toLowerCase().includes(keyword.toLowerCase()))
        ) {
            return true;
        }

        return false;
    };

    return events.filter(filter);
};

const mapCalendarResponse = (res: GaxiosResponse<calendar_v3.Schema$Events>): Promise<CalendarResult[] | null> => {
    if (!res.data.items) {
        return Promise.resolve(null);
    }

    return Promise.all(
        res.data.items
            .filter((x) => x.id)
            .map(async (x) => ({
                id: x.id as string,
                name: x.summary ?? undefined,
                link: x.htmlLink ?? undefined,
                start: x.start?.dateTime ?? x.start?.date ?? undefined,
                end: x.end?.dateTime ?? x.start?.date ?? undefined,
            })),
    );
};

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            await calendarClient.events
                .list({
                    calendarId: process.env.CALENDAR_ID,
                    timeMin: new Date().toISOString(),
                    maxResults: 135,
                    singleEvents: true,
                    orderBy: 'startTime',
                })
                .then(mapCalendarResponse)
                .then(filterCalendarEvents)
                .then((result) => res.status(200).json(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

export default handler;
