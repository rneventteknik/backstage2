import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithEntityNotFoundResponse } from '../../../lib/apiResponses';
import { fetchEquipmentPublicCategories } from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
        switch (req.method) {
            case 'GET':
                await fetchEquipmentPublicCategories()
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                return;

            default:
                respondWithEntityNotFoundResponse(res);
        }

        return;
    },
);

export default handler;
