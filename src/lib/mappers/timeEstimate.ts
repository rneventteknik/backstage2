import { TimeEstimate } from '../../models/interfaces';
import { ITimeEstimateObjectionModel } from '../../models/objection-models/TimeEstimateObjectionModel';
import { toDateOrUndefined } from '../utils';

export const toTimeEstimate = (objectionModel: ITimeEstimateObjectionModel): TimeEstimate => {
    if (!objectionModel.id) {
        throw 'Invalid time estimate';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};
