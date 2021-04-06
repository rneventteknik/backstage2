import { UserApiModel } from '../../interfaces/api-models/UserApiModel';
import { ensureDatabaseIsInitialized } from '../database';

export const fetchAuthUser = async (username: string): Promise<UserApiModel> => {
    ensureDatabaseIsInitialized();

    return UserApiModel.query()
        .where('username', username)
        .then((users) => users[0]);
};
