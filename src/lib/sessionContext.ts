import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-iron-session';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { respondWithAccessDeniedResponse } from './apiResponses';
import withSession from './session';

export interface SessionContext {
    currentUser: CurrentUserInfo;
}

export const getUserFromReq = (req: NextApiRequest & { session: Session }): CurrentUserInfo =>
    req.session.get<CurrentUserInfo>('user') ?? { isLoggedIn: false };

// Note: This method will automatically respond to non-logged-in users with 403 Access Denied. If the
// user is logged in this function calls the specified handler with the standard req and res parameters,
// as well as a context object with information about the context of the request (such as the current user)
export const withSessionContext = (
    handler: (req: NextApiRequest & { session: Session }, res: NextApiResponse, context: SessionContext) => unknown,
): ((...args: unknown[]) => Promise<unknown>) => {
    const internalHandler = (req: NextApiRequest & { session: Session }, res: NextApiResponse) => {
        const currentUser = getUserFromReq(req);

        if (!getUserFromReq(req).isLoggedIn) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        return handler(req, res, { currentUser: currentUser });
    };

    return withSession(internalHandler);
};
