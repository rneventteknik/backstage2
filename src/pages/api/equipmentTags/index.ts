import { NextApiRequest, NextApiResponse } from 'next';
import { fetchEquipmentTags } from '../../../lib/db-access/equipmentTag';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
    if (req.method === 'GET') {
        return fetchEquipmentTags()
            .then((result) => res.status(200).json(result))
            .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));
    }

    return;
};

export default handler;
