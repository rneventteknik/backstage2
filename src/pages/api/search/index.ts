import { NextApiRequest, NextApiResponse } from 'next';
import { SearchResult } from '../../../models/misc/SearchResult';
import { respondWithCustomErrorMessage } from '../../../lib/apiResponses';
import { searchEvents, searchUsers, searchEquipment } from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';

const numberOfEachType = 8;

const handler = withSessionContext(async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const searchString = Array.isArray(_req.query.s) ? _req.query.s[0] : _req.query.s;

    try {
        const result: SearchResult = {
            events: await searchEvents(searchString, numberOfEachType),
            equipment: await searchEquipment(searchString, numberOfEachType),
            users: await searchUsers(searchString, numberOfEachType),
        };

        res.status(200).json(result);
    } catch (error) {
        respondWithCustomErrorMessage(res, (error as { message: string }).message);
    }
});

export default handler;
