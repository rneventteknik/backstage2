import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
    respondWithEntityNotFoundResponse,
} from '../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';
import {
    fetchStatusTrackings,
    insertStatusTracking,
    validateStatusTrackingObjectionModel,
} from '../../../lib/db-access/statusTracking';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        switch (req.method) {
            case 'POST':
                if (!req.body.statusTracking) {
                    throw Error('Missing statusTracking parameter');
                }
                if (context.currentUser.role !== Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                if (!validateStatusTrackingObjectionModel(req.body.statusTracking)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }
                await insertStatusTracking(req.body.statusTracking)
                    .then((result) => {
                        res.status(200).json(result);
                    })
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'GET':
                await fetchStatusTrackings()
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
