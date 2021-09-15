import { User } from '../../interfaces';
import { IUserApiModel } from '../../interfaces/api-models/';
import { toDateOrUndefined } from '../utils';

export const toUser = (apiModel: IUserApiModel): User => {
    if (!apiModel.id) {
        throw 'Invalid user';
    }

    return {
        ...apiModel,
        id: apiModel.id,
        username: apiModel?.userAuth?.username,
        role: apiModel?.userAuth?.role,
        updated: toDateOrUndefined(apiModel.updated),
        created: toDateOrUndefined(apiModel.created),
    };
};
