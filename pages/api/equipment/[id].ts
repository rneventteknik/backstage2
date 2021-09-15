import { NextApiRequest, NextApiResponse } from 'next';
import {
    deleteEquipment,
    fetchEquipment,
    updateEquipment,
    validateEquipmentApiModel,
} from '../../../lib/data-interfaces';

const equipmentNotFoundResponse = { statusCode: 404, message: 'Equipment not found' };

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
    if (isNaN(Number(req.query.id))) {
        res.status(404).json(equipmentNotFoundResponse);
        return;
    }

    switch (req.method) {
        case 'GET':
            return fetchEquipment(Number(req.query.id))
                .then((result) =>
                    result ? res.status(200).json(result) : res.status(404).json(equipmentNotFoundResponse),
                )
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

        case 'DELETE':
            return deleteEquipment(Number(req.query.id))
                .then((result) => res.status(200).json(result))
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

        case 'PUT':
            if (!validateEquipmentApiModel(req.body.equipment)) {
                res.status(500).json({ statusCode: 500, message: 'Invalid equipment' });
                return;
            }

            // TODO Write to changelog here when it is implemented

            return updateEquipment(Number(req.query.id), req.body.equipment)
                .then((result) => res.status(200).json(result))
                .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

        default:
            res.status(404).json(equipmentNotFoundResponse);
            return;
    }
};

export default handler;
