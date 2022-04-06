import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { respondWithAccessDeniedResponse } from './apiResponses';
import { getAndVerifyUser } from './authenticate';
import { withApiSession } from './session';
import { IncomingMessage } from 'http';

export interface SessionContext {
    currentUser: CurrentUserInfo;
}

// Note: This method will automatically respond to non-logged-in users with 403 Access Denied. If the
// user is logged in this function calls the specified handler with the standard req and res parameters,
// as well as a context object with information about the context of the request (such as the current user)
export const withSessionContext = (
    handler: (req: NextApiRequest & IncomingMessage, res: NextApiResponse, context: SessionContext) => void,
): NextApiHandler => {
    const internalHandler = async (req: NextApiRequest & IncomingMessage, res: NextApiResponse) => {
        const currentUser = await getAndVerifyUser(req);

        if (!currentUser.isLoggedIn) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        return handler(req, res, { currentUser: currentUser });
    };

    return withApiSession(internalHandler);
};
