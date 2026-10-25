import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { respondWithAccessDeniedResponse } from './apiResponses';
import { getAndVerifyApiKey, getAndVerifyUser } from './authenticate';
import { getSession } from './session';
import { Role } from '../models/enums/Role';
import { hasSufficientAccess } from './utils';

export interface SessionContext {
    currentUser: CurrentUserInfo;
}

// Note: This method will automatically respond to non-logged-in users with 403 Access Denied. If the
// user is logged in this function calls the specified handler with the standard req and res parameters,
// as well as a context object with information about the context of the request (such as the current user)
export const withSessionContext = (
    handler: (req: NextApiRequest, res: NextApiResponse, context: SessionContext) => void,
    requiredRole: Role | null = Role.READONLY,
): NextApiHandler => {
    return async (req, res) => {
        const currentUser = await getAndVerifyUser(await getSession(req, res));

        if (!currentUser.isLoggedIn) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        if (!hasSufficientAccess(currentUser.role, requiredRole)) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        return handler(req, res, { currentUser: currentUser });
    };
};

export const withApiKeyContext = (
    handler: (req: NextApiRequest, res: NextApiResponse, context: SessionContext) => void,
): NextApiHandler => {
    return async (req, res) => {
        const currentUser = await getAndVerifyApiKey(req);

        if (!currentUser.isLoggedIn) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        return handler(req, res, { currentUser: currentUser });
    };
};
