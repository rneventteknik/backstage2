import currency from 'currency.js';
import { TimeEstimate } from '../../models/interfaces';
import { ITimeEstimateObjectionModel } from '../../models/objection-models/TimeEstimateObjectionModel';
import { toDatetimeOrUndefined } from '../datetimeUtils';

export const toTimeEstimate = (objectionModel: ITimeEstimateObjectionModel): TimeEstimate => {
    if (!objectionModel.id) {
        throw 'Invalid time estimate';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        pricePerHour: currency(objectionModel.pricePerHour),
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
    };
};
