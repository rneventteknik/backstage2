import { TimeReport } from '../../models/interfaces';
import { ITimeReportObjectionModel } from '../../models/objection-models/TimeReportObjectionModel';
import { toDateOrUndefined } from '../utils';
import { toUser } from './user';

export const toTimeReport = (objectionModel: ITimeReportObjectionModel): TimeReport => {
    if (!objectionModel.id) {
        throw 'Invalid time report';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
        startDatetime: toDateOrUndefined(objectionModel.startDatetime),
        endDatetime: toDateOrUndefined(objectionModel.endDatetime),
        user: objectionModel.user ? toUser(objectionModel.user) : undefined,
    };
};
