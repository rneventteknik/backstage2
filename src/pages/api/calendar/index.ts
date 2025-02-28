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
