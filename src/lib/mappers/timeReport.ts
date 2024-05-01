import currency from 'currency.js';
import { TimeReport } from '../../models/interfaces';
import { ITimeReportObjectionModel } from '../../models/objection-models/TimeReportObjectionModel';
import { toDatetimeOrUndefined } from '../datetimeUtils';
import { toUser } from './user';

export const toTimeReport = (objectionModel: ITimeReportObjectionModel): TimeReport => {
    if (!objectionModel.id) {
        throw 'Invalid time report';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        pricePerHour: currency(objectionModel.pricePerHour),
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
        startDatetime: toDatetimeOrUndefined(objectionModel.startDatetime),
        endDatetime: toDatetimeOrUndefined(objectionModel.endDatetime),
        user: objectionModel.user ? toUser(objectionModel.user) : undefined,
    };
};
