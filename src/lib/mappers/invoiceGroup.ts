import { toDateOrUndefined } from '../utils';
import { toUser } from './user';
import { IInvoiceGroupObjectionModel } from '../../models/objection-models/InvoiceGroupObjectionModel';
import { InvoiceGroup } from '../../models/interfaces/InvoiceGroup';
import { toBooking } from './booking';

export const toInvoiceGroup = (objectionModel: IInvoiceGroupObjectionModel): InvoiceGroup => {
    if (!objectionModel.id) {
        throw new Error('Invalid booking');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
        bookings: objectionModel.bookings ? objectionModel.bookings.map(toBooking) : undefined,
        user: objectionModel.user ? toUser(objectionModel.user) : undefined,
    };
};
