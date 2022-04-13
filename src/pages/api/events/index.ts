import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import { fetchEvents } from '../../../lib/db-access';
import { insertEvent, validateEventObjectionModel } from '../../../lib/db-access/event';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        switch (req.method) {
            case 'POST':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!req.body.event) {
                    throw Error('Missing event parameter');
                }

                if (!validateEventObjectionModel(req.body.event)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }
                
                await insertEvent(req.body.event)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'GET':
                await fetchEvents()
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
        return;
    },
);

export default handler;
