import { Event } from '../../interfaces';
import { IEventApiModel } from '../../interfaces/api-models/';
import { toDateOrUndefined } from '../utils';
import { toUser } from './user';

export const toEvent = (apiModel: IEventApiModel): Event => {
    if (!apiModel.id) {
        throw 'Invalid event';
    }

    return {
        ...apiModel,
        id: apiModel.id,
        ownerUser: toUser(apiModel.ownerUser),
        updated: toDateOrUndefined(apiModel.updated),
        created: toDateOrUndefined(apiModel.created),
    };
};
