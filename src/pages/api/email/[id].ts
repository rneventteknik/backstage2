import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import { withSessionContext } from '../../../lib/sessionContext';
import { getEmailThread } from '../../../lib/emailUtils';


const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const emailThreadId = req.query.id;

    if (!emailThreadId) {
        respondWithEntityNotFoundResponse(res);
        return;
    }

    switch (req.method) {
            case 'GET':
                console.log('TESTA')
                await getEmailThread(emailThreadId.toString())
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
    
                break;
    
            default:
                respondWithInvalidMethodResponse(res);
        }
        return;
});

export default handler;
