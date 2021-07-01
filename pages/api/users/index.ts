import { NextApiRequest, NextApiResponse } from 'next';
import { fetchUsers } from '../../../lib/data-interfaces';
import { insertUser, validateUserApiModel } from '../../../lib/data-interfaces/user';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
    if (req.method === 'POST') {
        if (!req.body.user) {
            throw Error('Missing user parameter');
        }

        if (!validateUserApiModel(req.body.user)) {
            res.status(500).json({ statusCode: 500, message: 'Invalid user' });
            return;
        }
        return insertUser(req.body.user)
            .then((result) => res.status(200).json(result))
            .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));
    } else if (req.method === 'GET') {
        return fetchUsers()
            .then((result) => res.status(200).json(result))
            .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));
    }

    return;
};

export default handler;
