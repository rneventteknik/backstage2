import { NextApiRequest, NextApiResponse } from 'next';
import { UserAuthApiModel } from '../../../../interfaces/api-models/UserApiModel';
import { UpdateAuthRequest } from '../../../../interfaces/auth/UpdateAuthApiModels';
import { getHashedPassword } from '../../../../lib/authenticate';
import {
    deleteUserAuth,
    insertUserAuth,
    updateUserAuth,
    validateUserAuthApiModel,
} from '../../../../lib/data-interfaces/userAuth';

const userNotFoundResponse = { statusCode: 404, message: 'User not found' };
const invalidDataResponse = { statusCode: 500, message: 'Invalid credentials' };

const getUserAuthModel = async (changePasswordRequest: UpdateAuthRequest): Promise<UserAuthApiModel> =>
    getHashedPassword(changePasswordRequest.password).then((hashedPassword) => {
        const userAuth = new UserAuthApiModel();
        userAuth.userId = changePasswordRequest.userId;
        userAuth.username = changePasswordRequest.username;
        userAuth.hashedPassword = hashedPassword;
        return userAuth;
    });

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
    if (isNaN(Number(req.query.id))) {
        res.status(404).json(userNotFoundResponse);
        return;
    }

    switch (req.method) {
        case 'DELETE':
            return deleteUserAuth(Number(req.query.id))
                .then((result) => res.status(200).json(result))
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

        case 'POST':
            if (!validateUserAuthApiModel(req.body.changePasswordRequest)) {
                res.status(500).json(invalidDataResponse);
                return;
            }
            return getUserAuthModel(req.body.changePasswordRequest)
                .then(insertUserAuth)
                .then((result) => res.status(200).json({ username: result.username }))
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

        case 'PUT':
            if (!validateUserAuthApiModel(req.body.changePasswordRequest)) {
                res.status(500).json(invalidDataResponse);
                return;
            }
            return getUserAuthModel(req.body.changePasswordRequest)
                .then((model) => updateUserAuth(model.userId, model))
                .then((result) => res.status(200).json({ username: result.username }))
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

        default:
            res.status(404).json(userNotFoundResponse);
            return;
    }
};

export default handler;
