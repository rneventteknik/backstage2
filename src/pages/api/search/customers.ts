import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage } from '../../../lib/apiResponses';
import { searchCustomers } from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';
import { getValueOrFirst } from '../../../lib/utils';
import { CustomersSearchResult } from '../../../models/misc/SearchResult';

const numberOfEachType = 12;

const handler = withSessionContext(async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const searchString = getValueOrFirst(_req.query.s);
    try {
        const result: CustomersSearchResult = {
            customers: await searchCustomers(searchString, numberOfEachType),
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
