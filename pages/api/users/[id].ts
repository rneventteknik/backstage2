import { NextApiRequest, NextApiResponse } from 'next';
import { deleteUser, fetchUser, updateUser, validateUserApiModel } from '../../../lib/data-interfaces';

const userNotFoundResponse = { statusCode: 404, message: 'User not found' };

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
    if (isNaN(Number(req.query.id))) {
        res.status(404).json(userNotFoundResponse);
        return;
    }

    switch (req.method) {
        case 'GET':
            return fetchUser(Number(req.query.id))
                .then((result) => (result ? res.status(200).json(result) : res.status(404).json(userNotFoundResponse)))
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

        case 'DELETE':
            return deleteUser(Number(req.query.id))
                .then((result) => res.status(200).json(result))
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

        case 'PUT':
            if (!validateUserApiModel(req.body.user)) {
                res.status(500).json({ statusCode: 500, message: 'Invalid user' });
                return;
            }
            return updateUser(Number(req.query.id), req.body.user)
                .then((result) => res.status(200).json(result))
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

        default:
            res.status(404).json(userNotFoundResponse);
            return;
    }
};

export default handler;
