import { NextApiRequest, NextApiResponse } from 'next';
import { fetchEquipments } from '../../../lib/db-access';
import { insertEquipment, validateEquipmentObjectionModel } from '../../../lib/db-access/equipment';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
    if (req.method === 'POST') {
        if (!req.body.equipment) {
            throw Error('Missing equipment parameter');
        }

        if (!validateEquipmentObjectionModel(req.body.equipment)) {
            res.status(500).json({ statusCode: 500, message: 'Invalid equipment' });
            return;
        }
        return insertEquipment(req.body.equipment)
            .then((result) => res.status(200).json(result))
            .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));
    } else if (req.method === 'GET') {
        return fetchEquipments()
            .then((result) => res.status(200).json(result))
            .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));
    }

    return;
};

export default handler;
