import { fetchAuthUser } from './data-interfaces/user';
import bcrypt from 'bcryptjs';
import { UserApiModel } from '../interfaces/api-models/UserApiModel';

const authenticate = async (username: string, password: string): Promise<UserApiModel | null> => {
    const user = await fetchAuthUser(username);

    if (!user) {
        return null;
    }

    return bcrypt.compare(password, user.hashedPassword).then((isAuthenticated) => (isAuthenticated ? user : null));
};

export default authenticate;
