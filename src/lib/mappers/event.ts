import { Event } from '../../models/interfaces';
import { IEventObjectionModel } from '../../models/objection-models';
import { toDateOrUndefined } from '../utils';
import { toUser } from './user';

export const toEvent = (objectionModel: IEventObjectionModel): Event => {
    if (!objectionModel.id) {
        throw 'Invalid event';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        ownerUser: objectionModel.ownerUser ? toUser(objectionModel.ownerUser) : undefined,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};
