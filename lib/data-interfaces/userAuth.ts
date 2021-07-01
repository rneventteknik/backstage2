import { UserAuthApiModel } from '../../interfaces/api-models/UserApiModel';
import { ensureDatabaseIsInitialized } from '../database';

// Note: The AuthUser works differently from most entities due to the nature of passwords,
// and since it does not have an id or created/update metohds. As such, do not use this data
// interface as an example.

export const fetchUserAuth = async (username: string): Promise<UserAuthApiModel> => {
    ensureDatabaseIsInitialized();

    return UserAuthApiModel.query()
        .where('username', username)
        .withGraphFetched('user')
        .then((users) => users[0]);
};

export const updateUserAuth = async (id: number, user: UserAuthApiModel): Promise<UserAuthApiModel> => {
    ensureDatabaseIsInitialized();

    return UserAuthApiModel.query().patchAndFetchById(id, user).debug();
};

export const insertUserAuth = async (user: UserAuthApiModel): Promise<UserAuthApiModel> => {
    ensureDatabaseIsInitialized();

    return UserAuthApiModel.query().insert(user);
};

export const deleteUserAuth = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return UserAuthApiModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateUserAuthApiModel = (user: UserAuthApiModel): boolean => {
    if (!user) return false;

    if (!user.username) return false;

    return true;
};
