import { NextApiRequest, NextApiResponse } from 'next';
import { fetchEquipmentPublicCategories } from '../../../lib/db-access/';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
    if (req.method === 'GET') {
        return fetchEquipmentPublicCategories()
            .then((result) => res.status(200).json(result))
            .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));
    }

    return;
};

export default handler;
