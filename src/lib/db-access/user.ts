import { MemberStatus } from '../../models/enums/MemberStatus';
import { UserObjectionModel } from '../../models/objection-models/UserObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { isMemberOfEnum } from '../utils';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const searchUsers = async (searchString: string, count: number): Promise<UserObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    const modifiedSearchString = '%' + searchString + '%';

    return UserObjectionModel.query()
        .where('name', 'ilike', modifiedSearchString)
        .orWhere('nameTag', 'ilike', modifiedSearchString)
        .orWhere('emailAddress', 'ilike', modifiedSearchString)
        .orderBy('updated', 'desc')
        .limit(count);
};

export const fetchUser = async (id: number): Promise<UserObjectionModel> => {
    ensureDatabaseIsInitialized();

    return UserObjectionModel.query().findById(id).withGraphFetched('userAuth');
};

export const fetchUsers = async (): Promise<UserObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    // Since all users can view this list, we do not include personal information here
    return UserObjectionModel.query()
        .select('id', 'name', 'created', 'updated', 'memberStatus', 'nameTag', 'phoneNumber', 'slackId', 'emailAddress')
        .withGraphFetched('userAuth');
};

export const updateUser = async (id: number, user: UserObjectionModel): Promise<UserObjectionModel> => {
    ensureDatabaseIsInitialized();

    return UserObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(user)));
};

export const insertUser = async (user: UserObjectionModel): Promise<UserObjectionModel> => {
    ensureDatabaseIsInitialized();

    return UserObjectionModel.query().insert(withCreatedDate(removeIdAndDates(user)));
};

export const deleteUser = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return UserObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateUserObjectionModel = (user: UserObjectionModel): boolean => {
    if (!user) return false;

    if (!user.name) return false;
    if (!user.nameTag) return false;
    if (!user.emailAddress) return false;

    if (!isMemberOfEnum(user.memberStatus, MemberStatus)) return false;

    return true;
};
