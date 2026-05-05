import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../lib/apiResponses';
import { withSessionContext } from '../../../lib/sessionContext';
import { getEmailThreads } from '../../../lib/emailUtils';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            await getEmailThreads()
                .then((result) => res.status(200).json(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
}, Role.USER);

export default handler;
