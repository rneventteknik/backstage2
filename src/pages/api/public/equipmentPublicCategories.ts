import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage } from '../../../lib/apiResponses';
import { fetchEquipmentPublicCategoriesPublic } from '../../../lib/db-access';

const handler = async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    await fetchEquipmentPublicCategoriesPublic()
        .then((result) => res.status(200).json(result))
        .catch((error) => respondWithCustomErrorMessage(res, error.message));
};

export default handler;
