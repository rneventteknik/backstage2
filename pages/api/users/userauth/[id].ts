import { NextApiRequest, NextApiResponse } from 'next';
import { UserAuthApiModel } from '../../../../interfaces/api-models/UserApiModel';
import { UpdateAuthRequest } from '../../../../interfaces/auth/UpdateAuthApiModels';
import { Role } from '../../../../interfaces/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import { getHashedPassword } from '../../../../lib/authenticate';
import {
    deleteUserAuth,
    insertUserAuth,
    updateUserAuth,
    validateUserAuthApiModel,
} from '../../../../lib/data-interfaces/userAuth';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';

const getUserAuthModel = async (changePasswordRequest: UpdateAuthRequest): Promise<UserAuthApiModel> =>
    getHashedPassword(changePasswordRequest.password).then((hashedPassword) => {
        const userAuth = new UserAuthApiModel();
        userAuth.userId = changePasswordRequest.userId;
        userAuth.username = changePasswordRequest.username;
        userAuth.hashedPassword = hashedPassword;
        return userAuth;
    });

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const userId = Number(req.query.id);

        if (isNaN(userId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'DELETE':
                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                await deleteUserAuth(userId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            case 'POST':
                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateUserAuthApiModel(req.body.changePasswordRequest)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await getUserAuthModel(req.body.changePasswordRequest)
                    .then(insertUserAuth)
                    .then((result) => res.status(200).json({ username: result.username }))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            case 'PUT':
                if (context.currentUser.role != Role.ADMIN && context.currentUser.userId != userId) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateUserAuthApiModel(req.body.changePasswordRequest)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await getUserAuthModel(req.body.changePasswordRequest)
                    .then((model) => updateUserAuth(model.userId, model))
                    .then((result) => res.status(200).json({ username: result.username }))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
