import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../lib/apiResponses';
import { fetchSettings } from '../../../lib/db-access/setting';
import { withSessionContext } from '../../../lib/sessionContext';
import { getGlobalSetting } from '../../../lib/utils';
import { CalendarResult } from '../../../models/misc/CalendarResult';
import { getCalendarEvents } from '../../../lib/calenderUtils';

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

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            await getCalendarEvents()
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
