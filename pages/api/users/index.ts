import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../interfaces/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import { fetchUsers } from '../../../lib/data-interfaces';
import { insertUser, validateUserApiModel } from '../../../lib/data-interfaces/user';
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

                if (!validateUserApiModel(req.body.user)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertUser(req.body.user)
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            case 'GET':
                await fetchUsers()
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }

        return;
    },
);

export default handler;
