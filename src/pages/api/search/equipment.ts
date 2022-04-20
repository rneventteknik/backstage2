import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage } from '../../../lib/apiResponses';
import { searchEquipment, searchEquipmentPackage } from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';
import { EquipmentSearchResult } from '../../../models/misc/SearchResult';

const numberOfEachType = 12;

const handler = withSessionContext(async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const searchString = Array.isArray(_req.query.s) ? _req.query.s[0] : _req.query.s;
    const includePackages = Array.isArray(_req.query.includePackages)
        ? _req.query.includePackages[0] === 'true'
        : _req.query.includePackages === 'true';

    try {
        const result: EquipmentSearchResult = {
            equipment: await searchEquipment(searchString, numberOfEachType),
            equipmentPackages: includePackages ? await searchEquipmentPackage(searchString, numberOfEachType) : [],
        };

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            respondWithCustomErrorMessage(res, error.message);
        } else {
            respondWithCustomErrorMessage(res, 'Unknown error');
        }
    }
});

export default handler;
