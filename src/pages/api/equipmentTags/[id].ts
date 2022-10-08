import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithEntityNotFoundResponse } from '../../../lib/apiResponses';
import { withSessionContext } from '../../../lib/sessionContext';
import { fetchEquipmentTagWithEquipment } from '../../../lib/db-access/equipmentTag';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const equipmentPackageId = Number(req.query.id);

    if (isNaN(equipmentPackageId)) {
        respondWithEntityNotFoundResponse(res);
        return;
    }

    switch (req.method) {
        case 'GET':
            await fetchEquipmentTagWithEquipment(equipmentPackageId)
                .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

            break;
    }
});

export default handler;
