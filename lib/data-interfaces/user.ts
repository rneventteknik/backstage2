import { MemberStatus } from '../../interfaces/enums/MemberStatus';
import { Role } from '../../interfaces/enums/Role';
import { UserApiModel } from '../../interfaces/api-models/UserApiModel';
import { ensureDatabaseIsInitialized } from '../database';
import { isMemberOfEnum } from '../utils';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

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

    return UserApiModel.query().findById(id).withGraphFetched('userAuth');
};

export const fetchUsers = async (): Promise<UserApiModel[]> => {
    ensureDatabaseIsInitialized();

    return UserApiModel.query().withGraphFetched('userAuth');
};

export const updateUser = async (id: number, user: UserApiModel): Promise<UserApiModel> => {
    ensureDatabaseIsInitialized();

    return UserApiModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(user)));
};

export const insertUser = async (user: UserApiModel): Promise<UserApiModel> => {
    ensureDatabaseIsInitialized();

    return UserApiModel.query().insert(withCreatedDate(removeIdAndDates(user)));
};

export const deleteUser = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return UserApiModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateUserApiModel = (user: UserApiModel): boolean => {
    if (!user) return false;

    if (!user.name) return false;
    if (!user.nameTag) return false;
    if (!user.emailAddress) return false;

    if (!isMemberOfEnum(user.role, Role)) return false;
    if (!isMemberOfEnum(user.memberStatus, MemberStatus)) return false;

    return true;
};
