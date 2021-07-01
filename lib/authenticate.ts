import bcrypt from 'bcryptjs';
import { fetchUserAuth } from './data-interfaces';
import { UserAuthApiModel } from '../interfaces/api-models/UserApiModel';

const authenticate = async (username: string, password: string): Promise<UserAuthApiModel | null> => {
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
