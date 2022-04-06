import bcrypt from 'bcryptjs';
import { fetchUserAuth } from './db-access';
import { UserAuthObjectionModel } from '../models/objection-models/UserObjectionModel';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { NextApiRequest } from 'next';
import { fetchUserAuthById } from './db-access/userAuth';
import { IncomingMessage } from 'http';

export const authenticate = async (username: string, password: string): Promise<UserAuthObjectionModel | null> => {
    const user = await fetchUserAuth(username);

    if (!user) {
        return null;
    }

    return bcrypt.compare(password, user.hashedPassword).then((isAuthenticated) => (isAuthenticated ? user : null));
};

export const getHashedPassword = async (password: string): Promise<string> => {
    return bcrypt.genSalt().then((salt) => bcrypt.hash(password, salt));
};

export const setSessionCookie = async (
    req: IncomingMessage,
    authUser: UserAuthObjectionModel,
    userInfoOverride: Partial<CurrentUserInfo> = {},
): Promise<CurrentUserInfo> => {
    const user: CurrentUserInfo = {
        isLoggedIn: true,
        userId: authUser.userId,
        name: authUser.user?.name,
        role: authUser.role,
        loginDate: Date.now(),
        ...userInfoOverride,
    };

    req.session.user = user;
    await req.session.save();

    return user;
};

export const destroySessionCookie = (req: NextApiRequest & IncomingMessage): void => req.session.destroy();

export const getUserFromReq = (req: NextApiRequest & IncomingMessage): CurrentUserInfo =>
    req.session.user ?? { isLoggedIn: false };

export const getAndVerifyUser = async (req: NextApiRequest & IncomingMessage): Promise<CurrentUserInfo> => {
    const currentUser = getUserFromReq(req);

    // We only need to verify the user if we are logged in
    if (!currentUser.isLoggedIn || !currentUser.userId) {
        return currentUser;
    }

    // Compare login time to current time if MAX_SESSION_LENGTH is set.
    if (
        process.env.MAX_SESSION_LENGTH &&
        (currentUser.loginDate ?? 0) + parseInt(process.env.MAX_SESSION_LENGTH) < Date.now()
    ) {
        // User has been logged in longer than MAX_SESSION_LENGTH: Log out
        destroySessionCookie(req);
        return { isLoggedIn: false };
    }

    const userFromDb = await fetchUserAuthById(currentUser.userId);

    if (!userFromDb) {
        // User has been removed: Log out
        destroySessionCookie(req);
        return { isLoggedIn: false };
    }

    if (userFromDb.role != currentUser.role || userFromDb.user?.name != currentUser.name) {
        // User has changed: Set a new session cookie, but do not change login date
        return await setSessionCookie(req, userFromDb, { loginDate: currentUser.loginDate });
    }

    // User from cookie is ok, return it and do not change any cookies
    return currentUser;
};
