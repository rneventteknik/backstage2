import { UserApiModel, UserAuthApiModel } from '../../interfaces/api-models/UserApiModel';
import { ensureDatabaseIsInitialized } from '../database';

export const fetchAuthUser = async (username: string): Promise<UserAuthApiModel> => {
    ensureDatabaseIsInitialized();

    return UserAuthApiModel.query()
        .where('username', username)
        .withGraphFetched('user')
        .then((users) => users[0]);
};

export const searchUsers = async (searchString: string, count: number): Promise<UserApiModel[]> => {
    ensureDatabaseIsInitialized();

    const modifiedSearchString = '%' + searchString + '%';

    return UserApiModel.query()
        .where('name', 'ilike', modifiedSearchString)
        .orWhere('nameTag', 'ilike', modifiedSearchString)
        .orWhere('emailAddress', 'ilike', modifiedSearchString)
        .orderBy('updated', 'desc')
        .limit(count);
};

export const fetchUser = async (id: number): Promise<UserApiModel> => {
    ensureDatabaseIsInitialized();

    return UserApiModel.query()
        .where('id', id)
        .then((users) => users[0]);
};
