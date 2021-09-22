import { User } from '../../models/interfaces';
import { IUserObjectionModel } from '../../models/objection-models';
import { toDateOrUndefined } from '../utils';

export const toUser = (objectionModel: IUserObjectionModel): User => {
    if (!objectionModel.id) {
        throw 'Invalid user';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        username: objectionModel?.userAuth?.username,
        role: objectionModel?.userAuth?.role,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};
