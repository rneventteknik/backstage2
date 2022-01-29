import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import { withSessionContext } from '../../../../lib/sessionContext';
import { fetchEventsForUser } from '../../../../lib/db-access';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        const userId = Number(req.query.id);

        if (isNaN(userId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchEventsForUser(userId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
