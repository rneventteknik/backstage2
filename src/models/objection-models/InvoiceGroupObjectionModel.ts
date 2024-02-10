import { Model, RelationMappingsThunk } from 'objection';
import {
    BaseObjectionModelWithName,
    BookingObjectionModel,
    IBookingObjectionModel,
    IUserObjectionModel,
    UserObjectionModel,
} from '.';

export interface IInvoiceGroupObjectionModel extends BaseObjectionModelWithName {
    userId: number;
    bookings?: IBookingObjectionModel[];
    user?: IUserObjectionModel;
}

export class InvoiceGroupObjectionModel extends Model implements IInvoiceGroupObjectionModel {
    static tableName = 'InvoiceGroup';

    static relationMappings: RelationMappingsThunk = () => ({
        bookings: {
            relation: Model.ManyToManyRelation,
            modelClass: BookingObjectionModel,
            join: {
                from: 'InvoiceGroup.id',
                through: {
                    from: 'BookingInvoiceGroup.invoiceGroupId',
                    to: 'BookingInvoiceGroup.bookingId',
                },
                to: 'Booking.id',
            },
        },
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserObjectionModel,
            filter: (query) =>
                query.select(
                    'id',
                    'name',
                    'created',
                    'updated',
                    'memberStatus',
                    'nameTag',
                    'phoneNumber',
                    'slackId',
                    'emailAddress',
                ),
            join: {
                from: 'InvoiceGroup.userId',
                to: 'User.id',
            },
        },
    });

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
    userId!: number;
    bookings?: BookingObjectionModel[];
    user?: UserObjectionModel;
}
