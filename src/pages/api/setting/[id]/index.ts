import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../../lib/apiResponses';
import { deleteSetting, updateSetting, validateSettingObjectionModel } from '../../../../lib/db-access/setting';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';
import { Role } from '../../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<Promise<void> | void> => {
        if (isNaN(Number(req.query.id))) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'DELETE':
                if (context.currentUser.role !== Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                return deleteSetting(Number(req.query.id))
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            case 'PUT':
                if (context.currentUser.role !== Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateSettingObjectionModel(req.body.setting)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                return updateSetting(Number(req.query.id), req.body.setting)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            default:
                respondWithEntityNotFoundResponse(res);
                return;
        }
    },
);

export default handler;
