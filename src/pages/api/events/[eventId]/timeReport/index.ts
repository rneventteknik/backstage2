import { NextApiRequest, NextApiResponse } from 'next';
import { fetchTimeReportsByEventId } from '../../../../../lib/db-access';
import { insertTimeReport, validateTimeReportObjectionModel } from '../../../../../lib/db-access/timeReport';
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
                if (!req.body.timeReport) {
                    throw Error('Missing time report parameter');
                }
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                if (!validateTimeReportObjectionModel(req.body.timeReport)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }
                await insertTimeReport(req.body.timeReport)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'GET':
                await fetchTimeReportsByEventId(eventId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
