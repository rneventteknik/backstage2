import { User } from '../../models/interfaces';
import { IUserObjectionModel } from '../../models/objection-models';
import { toDatetimeOrUndefined } from '../datetimeUtils';

export const toUser = (objectionModel: IUserObjectionModel): User => {
    if (!objectionModel.id) {
        throw new Error('Invalid user');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        username: objectionModel?.userAuth?.username,
        role: objectionModel?.userAuth?.role,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
        userCards: objectionModel.userCards?.map((card) => ({
            id: card.id!,
            userId: card.userId,
            cardName: card.cardName,
            created: toDatetimeOrUndefined(card.created),
        })),
    };
};
