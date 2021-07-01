import { User } from '../../interfaces';
import { IUserApiModel } from '../../interfaces/api-models/UserApiModel';
import { toDateOrUndefined } from '../utils';

export const toUser = (apiModel: IUserApiModel): User => {
    if (!apiModel.id) {
        throw 'Invalid user';
    }

    return {
        ...apiModel,
        id: apiModel.id,
        username: apiModel?.userAuth?.username,
        updated: toDateOrUndefined(apiModel.updated),
        created: toDateOrUndefined(apiModel.created),
    };
};
