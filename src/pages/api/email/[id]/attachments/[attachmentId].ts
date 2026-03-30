import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../../lib/apiResponses';
import { withSessionContext } from '../../../../../lib/sessionContext';
import { getEmailAttachment } from '../../../../../lib/emailUtils';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const messageId = req.query.id;
    const attachmentId = req.query.attachmentId;

    if (!messageId || !attachmentId) {
        respondWithEntityNotFoundResponse(res);
        return;
    }

    switch (req.method) {
        case 'GET':
            await getEmailAttachment(messageId.toString(), attachmentId.toString())
                .then((result) => {
                    if (result === null) {
                        respondWithEntityNotFoundResponse(res);
                        return;
                    }
                    res.status(200).json({ data: result });
                })
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

export default handler;
