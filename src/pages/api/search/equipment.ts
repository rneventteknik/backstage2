import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage } from '../../../lib/apiResponses';
import { searchEquipment, searchEquipmentPackage } from '../../../lib/db-access';
import { searchEquipmentTag } from '../../../lib/db-access/equipmentTag';
import { withSessionContext } from '../../../lib/sessionContext';
import { getValueOrFirst } from '../../../lib/utils';
import { EquipmentSearchResult } from '../../../models/misc/SearchResult';

const numberOfEachType = 12;

const handler = withSessionContext(async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const searchString = getValueOrFirst(_req.query.s);
    const includePackages = getValueOrFirst(_req.query.includePackages) === 'true';
    const includeTags = getValueOrFirst(_req.query.includeTags) === 'true';

    try {
        const result: EquipmentSearchResult = {
            equipment: await searchEquipment(searchString, numberOfEachType),
            equipmentPackages: includePackages ? await searchEquipmentPackage(searchString, numberOfEachType) : [],
            equipmentTags: includeTags ? await searchEquipmentTag(searchString, numberOfEachType) : [],
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
