import bcrypt from 'bcryptjs';
import { fetchUserAuth } from './db-access';
import { UserAuthObjectionModel } from '../models/objection-models/UserObjectionModel';

const authenticate = async (username: string, password: string): Promise<UserAuthObjectionModel | null> => {
    const user = await fetchUserAuth(username);

    if (!user) {
        return null;
    }

    return bcrypt.compare(password, user.hashedPassword).then((isAuthenticated) => (isAuthenticated ? user : null));
};

export const getHashedPassword = async (password: string): Promise<string> => {
    return bcrypt.genSalt().then((salt) => bcrypt.hash(password, salt));
};

export default authenticate;
