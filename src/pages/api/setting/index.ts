import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
    respondWithEntityNotFoundResponse,
} from '../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';
import { fetchSettings, insertSetting, validateSettingObjectionModel } from '../../../lib/db-access/setting';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        switch (req.method) {
            case 'POST':
                if (!req.body.setting) {
                    throw Error('Missing setting parameter');
                }
                if (context.currentUser.role !== Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                if (!validateSettingObjectionModel(req.body.setting)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }
                await insertSetting(req.body.setting)
                    .then((result) => {
                        res.status(200).json(result);
                    })
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'GET':
                await fetchSettings()
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
