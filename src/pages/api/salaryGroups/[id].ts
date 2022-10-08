import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithEntityNotFoundResponse, respondWithInvalidMethodResponse } from '../../../lib/apiResponses';
import { fetchSalaryGroup } from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const equipmentPackageId = Number(req.query.id);

    if (isNaN(equipmentPackageId)) {
        respondWithEntityNotFoundResponse(res);
        return;
    }

    switch (req.method) {
        case 'GET':
            await fetchSalaryGroup(equipmentPackageId)
                .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
});

export default handler;
