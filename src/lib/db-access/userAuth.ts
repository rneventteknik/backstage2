import { UserAuthObjectionModel } from '../../models/objection-models/UserObjectionModel';
import { Role } from '../../models/enums/Role';
import { ensureDatabaseIsInitialized } from '../database';
import { isMemberOfEnum } from '../utils';

// Note: The AuthUser works differently from most entities due to the nature of passwords,
// and since it does not have an id or created/update metohds. As such, do not use this data
// interface as an example.

export const fetchUserAuth = async (username: string): Promise<UserAuthObjectionModel> => {
    ensureDatabaseIsInitialized();

    return UserAuthObjectionModel.query()
        .where('username', username.toLowerCase())
        .withGraphFetched('user')
        .then((users) => users[0]);
};

export const fetchUserAuthById = async (id: number): Promise<UserAuthObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();

    return UserAuthObjectionModel.query().findById(id).withGraphFetched('user');
};

export const updateUserAuth = async (id: number, user: UserAuthObjectionModel): Promise<UserAuthObjectionModel> => {
    ensureDatabaseIsInitialized();

    // Ensure lowercase username
    user.username = user.username.toLowerCase();

    return UserAuthObjectionModel.query().patchAndFetchById(id, user);
};

export const insertUserAuth = async (user: UserAuthObjectionModel): Promise<UserAuthObjectionModel> => {
    ensureDatabaseIsInitialized();

    // Ensure lowercase username
    user.username = user.username.toLowerCase();

    return UserAuthObjectionModel.query().insert(user);
};

export const deleteUserAuth = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return UserAuthObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateUserAuthObjectionModel = (user: UserAuthObjectionModel): boolean => {
    if (!user) return false;

    if (!user.username) return false;

    if (user.role !== undefined && !isMemberOfEnum(user.role, Role)) return false;

    return true;
};
