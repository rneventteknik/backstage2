import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import { SessionContext, withApiKeyContext } from '../../../../lib/sessionContext';
import { Role } from '../../../../models/enums/Role';
import {
    fetchStatusTrackingByKey,
    fetchStatusTrackingsPublic,
    updateStatusTracking,
} from '../../../../lib/db-access/statusTracking';

const handler = withApiKeyContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const statusUpdate = req.body.statusUpdate as { key: string; value: string };

        if (!statusUpdate || !statusUpdate.key || !statusUpdate.value) {
            respondWithInvalidDataResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchStatusTrackingsPublic()
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'POST':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                const statusTracking = await fetchStatusTrackingByKey(statusUpdate.key.trim());

                if (!statusTracking) {
                    respondWithEntityNotFoundResponse(res);
                    return;
                }

                return updateStatusTracking(statusTracking.id, {
                    ...statusTracking,
                    value: statusUpdate.value,
                    lastStatusUpdate: new Date().toISOString(),
                })
                    .then(() => res.status(200).json({ value: statusUpdate.value }))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            default:
                respondWithInvalidMethodResponse(res);
        }
        return;
    },
);

export default handler;
