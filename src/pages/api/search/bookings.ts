import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage } from '../../../lib/apiResponses';
import { searchBookings } from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';
import { BookingsSearchResult } from '../../../models/misc/SearchResult';

const numberOfEachType = 12;

const handler = withSessionContext(async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const searchString = Array.isArray(_req.query.s) ? _req.query.s[0] : _req.query.s;
    try {
        const result: BookingsSearchResult = {
            bookings: await searchBookings(searchString, numberOfEachType),
        };

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            respondWithCustomErrorMessage(res, error.message);
        } else {
            respondWithCustomErrorMessage(res, 'Unknown error');
        }
    }
});

export default handler;
