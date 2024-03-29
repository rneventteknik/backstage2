import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import { deleteUser, fetchUser, updateUser, validateUserObjectionModel } from '../../../../lib/db-access';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const userId = Number(req.query.id);

        if (isNaN(userId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                const includePersonalInformation =
                    context.currentUser.role != Role.ADMIN && context.currentUser.userId != userId;

                await fetchUser(userId, includePersonalInformation)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                return;

            case 'DELETE':
                if (context.currentUser.role != Role.ADMIN || context.currentUser.userId === userId) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                await deleteUser(userId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                return;

            case 'PUT':
                if (context.currentUser.role != Role.ADMIN && context.currentUser.userId != userId) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateUserObjectionModel(req.body.user)) {
                    res.status(500).json({ statusCode: 500, message: 'Invalid user' });
                    return;
                }

                await updateUser(userId, req.body.user)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                return;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
