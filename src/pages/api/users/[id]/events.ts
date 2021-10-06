import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';
import { fetchEventsForUser } from '../../../../lib/db-access';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const userId = Number(req.query.id);

        if (isNaN(userId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                if (context.currentUser.role != Role.ADMIN && context.currentUser.userId != userId) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                await fetchEventsForUser(userId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
