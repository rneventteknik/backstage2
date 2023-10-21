import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import { SessionContext, withApiKeyContext } from '../../../../lib/sessionContext';
import { fetchSettings, updateSetting } from '../../../../lib/db-access/setting';
import { toSetting } from '../../../../lib/mappers/setting';
import { Role } from '../../../../models/enums/Role';
import { StatusTrackingData } from '../../../../models/misc/StatusTrackingData';

const handler = withApiKeyContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const statusUpdate = req.body.statusUpdate as { key: string; value: string };

        if (!statusUpdate || !statusUpdate.key || !statusUpdate.value) {
            respondWithInvalidDataResponse(res);
            return;
        }

        const globalSettings = await fetchSettings();
        const statusTrackingSetting = globalSettings?.find((x) => x.key == 'system.statusTracking');

        if (!statusTrackingSetting || !statusTrackingSetting.value) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const statusTrackingData = JSON.parse(statusTrackingSetting.value) as StatusTrackingData;

        switch (req.method) {
            case 'GET':
                res.status(200).send(statusTrackingSetting?.value);
                break;

            case 'POST':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!statusTrackingData.some((x) => x.key === statusUpdate.key)) {
                    respondWithEntityNotFoundResponse(res);
                    return;
                }

                const updatedStatusTrackingData = statusTrackingData.map((x) =>
                    x.key !== statusUpdate.key ? x : { ...x, value: statusUpdate.value, updated: new Date() },
                );
                statusTrackingSetting.value = JSON.stringify(updatedStatusTrackingData);

                return updateSetting(Number(toSetting(statusTrackingSetting).id), statusTrackingSetting)
                    .then(() => res.status(200).json(updatedStatusTrackingData))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            default:
                respondWithInvalidMethodResponse(res);
        }
        return;
    },
);

export default handler;
