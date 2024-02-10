import { Model, RelationMappingsThunk } from 'objection';
import {
    BaseObjectionModelWithName,
    BookingObjectionModel,
    IBookingObjectionModel,
    IUserObjectionModel,
    UserObjectionModel,
} from '.';

export interface ISalaryGroupObjectionModel extends BaseObjectionModelWithName {
    userId: number;
    bookings?: IBookingObjectionModel[];
    user?: IUserObjectionModel;
}

export class SalaryGroupObjectionModel extends Model implements ISalaryGroupObjectionModel {
    static tableName = 'SalaryGroup';

    static relationMappings: RelationMappingsThunk = () => ({
        bookings: {
            relation: Model.ManyToManyRelation,
            modelClass: BookingObjectionModel,
            join: {
                from: 'SalaryGroup.id',
                through: {
                    from: 'BookingSalaryGroup.salaryGroupId',
                    to: 'BookingSalaryGroup.bookingId',
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
                from: 'SalaryGroup.userId',
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
