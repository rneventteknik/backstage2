import { toDatetimeOrUndefined } from '../datetimeUtils';
import { IStatusTrackingObjectionModel } from '../../models/objection-models/StatusTrackingObjectionModel';
import { StatusTracking } from '../../models/interfaces/StatusTracking';

export const toStatusTracking = (objectionModel: IStatusTrackingObjectionModel): StatusTracking => {
    if (!objectionModel.id) {
        throw new Error('Invalid booking');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
        lastStatusUpdate: toDatetimeOrUndefined(objectionModel.lastStatusUpdate),
    };
};
