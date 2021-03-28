import { fetchAuthUser } from './data-interfaces/user';
import bcrypt from 'bcryptjs';
import { UserAuthModel } from '../interfaces/auth-models/UserAuthModel';

const authenticate = async (username: string, password: string): Promise<UserAuthModel | null> => {
    const user = await fetchAuthUser(username);

    if (!user) {
        return null;
    }

    return bcrypt.compare(password, user.hashedPassword).then((isAuthenticated) => (isAuthenticated ? user : null));
};

export default authenticate;
