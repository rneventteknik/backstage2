import { NextApiRequest, NextApiResponse } from 'next';
import { setSessionCookie, authenticateByCardId } from '../../../../lib/authenticate';
import { getSession } from '../../../../lib/session';
import { hasVerifiedClientCertificate } from '../../../../lib/clientCertificate';
import { isValidCardId } from '../../../../lib/cardId';
import { respondWithAccessDeniedResponse, respondWithInvalidMethodResponse } from '../../../../lib/apiResponses';

// Card login is only allowed from computers with a client certificate. Cloudflare should also block requests
// to this route without a verified certificate, this check covers requests that bypass Cloudflare.
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (req.method !== 'POST') {
        respondWithInvalidMethodResponse(res);
        return;
    }

    if (!hasVerifiedClientCertificate(req)) {
        respondWithAccessDeniedResponse(res);
        return;
    }

    const requestBody: { cardId?: string } = await req.body;
    const cardId = requestBody.cardId;

    if (!cardId || !isValidCardId(cardId)) {
        res.status(403).json({ statusCode: 403, message: 'Invalid card ID' });
        return;
    }

    const authUser = await authenticateByCardId(cardId);

    if (authUser) {
        await setSessionCookie(await getSession(req, res), authUser).then((user) => res.status(200).json(user));
    } else {
        res.status(403).json({ statusCode: 403, message: 'Invalid login' });
    }
};

export default handler;
