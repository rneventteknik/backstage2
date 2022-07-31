import bcrypt from 'bcryptjs';
import { fetchUserAuth } from './db-access';
import { UserAuthObjectionModel } from '../models/objection-models/UserObjectionModel';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { NextApiRequest } from 'next';
import { fetchUserAuthByLoginToken, fetchUserAuthById, updateUserAuth } from './db-access/userAuth';
import { IncomingMessage } from 'http';
import { sealData, unsealData } from 'iron-session';
import { LoginToken } from '../models/misc/LoginToken';

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

export const sealLoginToken = async (loginToken: LoginToken) => {
    return await sealData(loginToken, { password: process.env.SECRET_COOKIE_PASSWORD ?? '' });
};

export const unsealLoginToken = async (sealedLoginToken: string) => {
    return (await unsealData(sealedLoginToken, { password: process.env.SECRET_COOKIE_PASSWORD ?? '' })) as LoginToken;
};

export const authenticateWithLoginToken = async (
    sealedToken: string,
    ip: string,
): Promise<UserAuthObjectionModel | null> => {
    const token = await unsealLoginToken(sealedToken);

    // First verify that there is user with this token
    const userAuth = await fetchUserAuthByLoginToken(token.tokenId);

    if (!userAuth) {
        return null;
    }

    // Second, verify time
    if (!userAuth.loginTokenExpirationDate || new Date(userAuth.loginTokenExpirationDate) < new Date()) {
        return null;
    }

    // Third, verify ip adress
    if (ip !== userAuth.loginTokenIp) {
        return null;
    }

    // Login successfull, remove token from DB
    await updateUserAuth(userAuth.userId, {
        loginToken: null,
        loginTokenIp: null,
        loginTokenExpirationDate: null,
    });

    return userAuth;
};
