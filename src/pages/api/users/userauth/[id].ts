import { NextApiRequest, NextApiResponse } from 'next';
import { UserAuthObjectionModel } from '../../../../models/objection-models/UserObjectionModel';
import { UpdateAuthRequest } from '../../../../models/misc/UpdateAuthApiModels';
import { Role } from '../../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import { authenticateById, getHashedPassword } from '../../../../lib/authenticate';
import {
    deleteUserAuth,
    insertUserAuth,
    updateUserAuth,
    validateUserAuthObjectionModel,
} from '../../../../lib/db-access/userAuth';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';
import { CurrentUserInfo } from '../../../../models/misc/CurrentUserInfo';

const getUserAuthModel = async (
    updateAuthRequest: UpdateAuthRequest,
    currentUser: CurrentUserInfo,
): Promise<UserAuthObjectionModel> => {
    const userAuth = new UserAuthObjectionModel();
    userAuth.userId = updateAuthRequest.userId;
    userAuth.username = updateAuthRequest.username;

    if (currentUser.role == Role.ADMIN) {
        userAuth.role = updateAuthRequest.role;
    }

    if (updateAuthRequest.password) {
        userAuth.hashedPassword = await getHashedPassword(updateAuthRequest.password);
    }

    return userAuth;
};

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

                // Verify password
                if (
                    !(await authenticateById(
                        context.currentUser.userId,
                        req.body.changePasswordRequest.existingPassword,
                    ))
                ) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateUserAuthObjectionModel(req.body.changePasswordRequest)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await getUserAuthModel(req.body.changePasswordRequest, context.currentUser)
                    .then(insertUserAuth)
                    .then((result) => res.status(200).json({ username: result.username }))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            case 'PUT':
                if (context.currentUser.role != Role.ADMIN && context.currentUser.userId != userId) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                // Verify password
                if (
                    !(await authenticateById(
                        context.currentUser.userId,
                        req.body.changePasswordRequest.existingPassword,
                    ))
                ) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateUserAuthObjectionModel(req.body.changePasswordRequest)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await getUserAuthModel(req.body.changePasswordRequest, context.currentUser)
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
