import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage } from '../../../../lib/apiResponses';
import { unsealLoginToken } from '../../../../lib/authenticate';
import { updateUserAuth } from '../../../../lib/db-access';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';

const handler = withSessionContext(
    async (_req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const sealedToken = Array.isArray(_req.query.sealedToken) ? _req.query.sealedToken[0] : _req.query.sealedToken;
        const token = await unsealLoginToken(sealedToken);
        const currentUserId = context.currentUser.userId;

        if (!currentUserId) {
            respondWithCustomErrorMessage(res, 'Invalid user');
            return;
        }

        if (!token) {
            respondWithCustomErrorMessage(res, 'Invalid token');
            return;
        }

        // Token is valid for 60 seconds
        const tokenExpirationDate = new Date(Date.now() + 60 * 1000).toISOString();

        await updateUserAuth(currentUserId, {
            loginToken: token.tokenId,
            loginTokenIp: token.ip,
            loginTokenExpirationDate: tokenExpirationDate,
        })
            .then(() =>
                res.status(200).json({
                    token: token.tokenId,
                    magicTokenExpirationDate: tokenExpirationDate,
                }),
            )
            .catch((error) => respondWithCustomErrorMessage(res, error.message));

        return;
    },
);

export default handler;
