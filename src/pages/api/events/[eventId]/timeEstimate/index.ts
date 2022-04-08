import { NextApiRequest, NextApiResponse } from 'next';
import { fetchTimeEstimatesByEventId } from '../../../../../lib/db-access';
import { insertTimeEstimate, validateTimeEstimateObjectionModel } from '../../../../../lib/db-access/time-estimate';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
    respondWithEntityNotFoundResponse,
} from '../../../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import { Role } from '../../../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const eventId = Number(req.query.eventId);

        if (isNaN(eventId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'POST':
                if (!req.body.timeEstimate) {
                    throw Error('Missing time estimate parameter');
                }
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                if (!validateTimeEstimateObjectionModel(req.body.timeEstimate)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }
                await insertTimeEstimate(req.body.timeEstimate)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'GET':
                await fetchTimeEstimatesByEventId(eventId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
