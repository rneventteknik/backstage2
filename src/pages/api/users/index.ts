import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import { fetchUsers } from '../../../lib/db-access';
import { insertUser, validateUserObjectionModel } from '../../../lib/db-access/user';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        switch (req.method) {
            case 'POST':
                if (!req.body.user) {
                    throw Error('Missing user parameter');
                }

                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateUserObjectionModel(req.body.user)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertUser(req.body.user)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                return;

            case 'GET':
                await fetchUsers()
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                return;

            default:
                respondWithInvalidMethodResponse(res);
        }

        return;
    },
);

export default handler;
