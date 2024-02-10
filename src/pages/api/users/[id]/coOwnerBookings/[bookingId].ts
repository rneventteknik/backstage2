import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import {
    registerUserAsCoOwnerForBooking,
    unRegisterUserAsCoOwnerForBooking,
} from '../../../../../lib/db-access/booking';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const userId = Number(req.query.id);
        const bookingId = Number(req.query.bookingId);

        if (isNaN(userId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'DELETE':
                if (context.currentUser.userId != userId) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                await unRegisterUserAsCoOwnerForBooking(userId, bookingId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'PUT':
                if (context.currentUser.userId != userId) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                await registerUserAsCoOwnerForBooking(userId, bookingId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
