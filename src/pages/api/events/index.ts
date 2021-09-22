import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage } from '../../../lib/apiResponses';
import { fetchEvents } from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(
    async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        await fetchEvents()
            .then((result) => res.status(200).json(result))
            .catch((error) => respondWithCustomErrorMessage(res, error.message));
    },
);

export default handler;
