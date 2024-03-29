import { NextApiRequest, NextApiResponse } from 'next';
import { SearchResult } from '../../../models/misc/SearchResult';
import { respondWithCustomErrorMessage } from '../../../lib/apiResponses';
import { searchBookings, searchUsers, searchEquipment, searchEquipmentPackage } from '../../../lib/db-access';
import { withSessionContext } from '../../../lib/sessionContext';
import { getValueOrFirst } from '../../../lib/utils';

const numberOfEachType = 8;

const handler = withSessionContext(async (_req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const searchString = getValueOrFirst(_req.query.s) ?? '';

    try {
        const result: SearchResult = {
            bookings: await searchBookings(searchString, numberOfEachType),
            equipment: await searchEquipment(searchString, numberOfEachType),
            equipmentPackage: await searchEquipmentPackage(searchString, numberOfEachType),
            users: await searchUsers(searchString, numberOfEachType),
        };

        res.status(200).json(result);
    } catch (error) {
        respondWithCustomErrorMessage(res, (error as { message: string }).message);
    }
});

export default handler;
