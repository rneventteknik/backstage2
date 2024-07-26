import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithEntityNotFoundResponse } from '../../../lib/apiResponses';
import { withSessionContext } from '../../../lib/sessionContext';
import { fetchOutEquipmentLists } from '../../../lib/db-access/equipmentList';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';
import { groupBy, reduceSumFn } from '../../../lib/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<Promise<void> | void> => {
    switch (req.method) {
        case 'GET':
            await fetchOutEquipmentLists()
                .then(getEquipmentFromLists)
                .then((result) => res.status(200).json(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            return;

        default:
            respondWithEntityNotFoundResponse(res);
    }

    return;
};

export default handler;

const getEquipmentFromLists = (equipmentLists: EquipmentList[]) => {
    const listEntries = equipmentLists.flatMap((list) => [
        ...list.listEntries,
        ...list.listHeadings.flatMap((heading) => heading.listEntries),
    ]);

    const equipmentGroupings = groupBy(
        listEntries.filter((x) => x.equipmentId),
        (x) => x.equipmentId?.toString() ?? '0',
    );
    const equipmentWithCount = Object.keys(equipmentGroupings).map((key) => {
        const records = equipmentGroupings[key];
        return {
            equipmentId: key,
            id: records[0].id,
            name: records[0].equipment?.name,
            numberOfUnits: records.map((x) => x.numberOfUnits).reduce(reduceSumFn, 0),
        };
    });

    const customRows = listEntries
        .filter((x) => !x.equipment)
        .map((x) => ({ name: x.name, id: x.id, numberOfUnits: x.numberOfUnits }));

    return [...equipmentWithCount, ...customRows];
};
