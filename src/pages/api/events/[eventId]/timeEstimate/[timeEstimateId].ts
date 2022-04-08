import { NextApiRequest, NextApiResponse } from 'next';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import { Role } from '../../../../../models/enums/Role';
import {
    fetchTimeEstimate,
    updateTimeEstimate,
    deleteTimeEstimate,
    validateTimeEstimateObjectionModel,
} from '../../../../../lib/db-access';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithAccessDeniedResponse,
} from '../../../../../lib/apiResponses';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const eventId = Number(req.query.eventId);
        const timeEstimateId = Number(req.query.timeEstimateId);

        if (isNaN(eventId) || isNaN(timeEstimateId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchTimeEstimate(timeEstimateId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'DELETE':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                await deleteTimeEstimate(timeEstimateId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'PUT':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                if (!validateTimeEstimateObjectionModel(req.body.timeEstimate)) {
                    respondWithEntityNotFoundResponse(res);
                    return;
                }

                // TODO Write to changelog here when it is implemented??

                await updateTimeEstimate(timeEstimateId, req.body.timeEstimate)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithEntityNotFoundResponse(res);
        }
    },
);

export default handler;
