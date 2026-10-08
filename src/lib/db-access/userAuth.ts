import { UserAuthObjectionModel } from '../../models/objection-models/UserObjectionModel';
import { UserCardObjectionModel } from '../../models/objection-models/UserCardObjectionModel';
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

export const fetchUserAuthByHashedCardId = async (
    hashedCardId: string,
): Promise<UserAuthObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();

    const userCard = await UserCardObjectionModel.query().where('hashedCardId', hashedCardId).first();

    if (!userCard) {
        return undefined;
    }

    return UserAuthObjectionModel.query().findById(userCard.userId).withGraphFetched('user');
};
export const isUserCardRegistered = async (hashedCardId: string): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return UserCardObjectionModel.query()
        .where('hashedCardId', hashedCardId)
        .first()
        .then((card) => !!card);
};

export const insertUserCard = async (userCard: UserCardObjectionModel): Promise<UserCardObjectionModel> => {
    ensureDatabaseIsInitialized();

    return UserCardObjectionModel.query().insert(userCard);
};

// Only deletes cards belonging to the given user, so a card id from another user is ignored
export const deleteUserCards = async (userId: number, cardIds: number[]): Promise<number> => {
    ensureDatabaseIsInitialized();

    return UserCardObjectionModel.query().delete().where('userId', userId).whereIn('id', cardIds);
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
