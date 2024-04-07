import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../../lib/apiResponses';
import { withApiKeyContext } from '../../../../../lib/sessionContext';
import { fetchUserByNameTagForExternalApi } from '../../../../../lib/db-access/user';
import { getValueOrFirst } from '../../../../../lib/utils';

const handler = withApiKeyContext(
    async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        const userTag = getValueOrFirst(req.query.nameTag) ?? '';

        if (userTag.length === 0) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchUserByNameTagForExternalApi(userTag)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                return;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
