import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithEntityNotFoundResponse } from '../../../lib/apiResponses';
import { fetchEvent } from '../../../lib/data-interfaces';
import { withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(
    async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        await fetchEvent(Number(_req.query.id))
            .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
            .catch((error) => respondWithCustomErrorMessage(res, error.message));
    },
);

export default handler;
