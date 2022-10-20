import { toDatetimeOrUndefined } from '../datetimeUtils';
import { ICustomerObjectionModel } from '../../models/objection-models/CustomerObjectionModel';
import { Customer } from '../../models/interfaces/Customer';

export const toCustomer = (objectionModel: ICustomerObjectionModel): Customer => {
    if (!objectionModel.id) {
        throw new Error('Invalid booking');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
    };
};
