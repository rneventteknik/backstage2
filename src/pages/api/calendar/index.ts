import { calendar_v3, calendar } from '@googleapis/calendar';
import { GaxiosResponse } from 'googleapis-common';
import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../lib/apiResponses';
import { fetchFirstBookingByCalendarBookingId } from '../../../lib/db-access/booking';
import { fetchSettings } from '../../../lib/db-access/setting';
import { withSessionContext } from '../../../lib/sessionContext';
import { getGlobalSetting } from '../../../lib/utils';
import { CalendarResult } from '../../../models/misc/CalendarResult';
import { getNameTagsFromEventName, getUsersIdsFromEventName } from '../../../lib/calenderUtils';

const calendarClient = calendar({
    version: 'v3',
    auth: process.env.CALENDAR_API_KEY,
});

const filterCalendarEvents = async (events: CalendarResult[] | null) => {
    if (!events) {
        return null;
    }

    const globalSettings = await fetchSettings();
    const keywordBlackList: string[] = JSON.parse(
        getGlobalSetting('googleCalendar.keywordBlackList', globalSettings, '[]'),
    );

    const filter = (event: CalendarResult) => {
        if (
            keywordBlackList &&
            keywordBlackList.length > 0 &&
            keywordBlackList.some((bannedKeyword) => event.name?.toLowerCase().includes(bannedKeyword.toLowerCase()))
        ) {
            return false;
        }

        return true;
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
                description: x.description ?? undefined,
                link: x.htmlLink ?? undefined,
                location: x.location ?? undefined,
                creator: x.creator?.displayName ?? x.creator?.email ?? undefined,
                start: x.start?.dateTime ?? x.start?.date ?? undefined,
                end: x.end?.dateTime ?? x.start?.date ?? undefined,
                existingBookingId: (await fetchFirstBookingByCalendarBookingId(x.id as string))?.id,
                initials: getNameTagsFromEventName(x.summary ?? ''),
                workingUsersIds: await getUsersIdsFromEventName(x.summary ?? ''),
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
