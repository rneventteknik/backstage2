import { NextApiRequest, NextApiResponse } from 'next';
import { SearchResult } from '../../../interfaces/search/SearchResult';
import { searchEvents, searchUsers } from '../../../lib/data-interfaces/';

const numberOfEachType = 8;

const handler = async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const searchString = Array.isArray(_req.query.s) ? _req.query.s[0] : _req.query.s;

    try {
        const result: SearchResult = {
            events: await searchEvents(searchString, numberOfEachType),
            equipment: [], // TODO add search query once table exists
            users: await searchUsers(searchString, numberOfEachType),
        };

        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ statusCode: 500, message: err.message });
    }
};

export default handler;
