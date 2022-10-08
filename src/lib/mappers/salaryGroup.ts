import { toUser } from './user';
import { ISalaryGroupObjectionModel } from '../../models/objection-models/SalaryGroupObjectionModel';
import { SalaryGroup } from '../../models/interfaces/SalaryGroup';
import { toBooking } from './booking';
import { toDatetimeOrUndefined } from '../datetimeUtils';

export const toSalaryGroup = (objectionModel: ISalaryGroupObjectionModel): SalaryGroup => {
    if (!objectionModel.id) {
        throw new Error('Invalid booking');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
        bookings: objectionModel.bookings ? objectionModel.bookings.map(toBooking) : undefined,
        user: objectionModel.user ? toUser(objectionModel.user) : undefined,
    };
};
