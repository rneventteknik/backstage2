import { Model, RelationMappingsThunk } from 'objection';
import { BaseObjectionModelWithName, BookingObjectionModel } from '.';
import { IBookingObjectionModel } from './BookingObjectionModel';
import { UserCardObjectionModel, IUserCardObjectionModel } from './UserCardObjectionModel';

export interface IUserObjectionModel extends BaseObjectionModelWithName {
    id?: number;
    name: string;
    created?: string;
    updated?: string;
    memberStatus: number;
    nameTag: string;
    phoneNumber: string;
    slackId: string;
    emailAddress: string;

    // The below properties contain personal information and are therefore not included in all api endpoints.
    personalIdentityNumber?: string;
    bankName?: string;
    clearingNumber?: string;
    bankAccount?: string;
    homeAddress?: string;

    bookings?: IBookingObjectionModel[];
    userAuth?: IUserAuthObjectionModel;
    userCards?: IUserCardObjectionModel[];
}

export class UserObjectionModel extends Model implements IUserObjectionModel {
    static tableName = 'User';

    static relationMappings: RelationMappingsThunk = () => ({
        bookings: {
            relation: Model.HasManyRelation,
            modelClass: BookingObjectionModel,
            join: {
                from: 'User.id',
                to: 'Booking.ownerUserId',
            },
        },
        userAuth: {
            relation: Model.HasOneRelation,
            modelClass: UserAuthObjectionModel,
            filter: (query) => query.select('userId', 'username', 'role'),
            join: {
                from: 'User.id',
                to: 'UserAuth.userId',
            },
        },
        userCards: {
            relation: Model.HasManyRelation,
            modelClass: UserCardObjectionModel,
            join: {
                from: 'User.id',
                to: 'UserCard.userId',
            },
        },
        coOwnerBookings: {
            relation: Model.ManyToManyRelation,
            modelClass: BookingObjectionModel,
            join: {
                from: 'User.id',
                through: {
                    from: 'CoOwner.userId',
                    to: 'CoOwner.bookingId',
                },
                to: 'Booking.id',
            },
        },
    });

    id?: number;
    name!: string;
    created?: string;
    updated?: string;
    memberStatus!: number;
    nameTag!: string;
    phoneNumber!: string;
    slackId!: string;
    personalIdentityNumber!: string;
    bankName!: string;
    clearingNumber!: string;
    bankAccount!: string;
    homeAddress!: string;
    emailAddress!: string;

    bookings?: BookingObjectionModel[];
    userAuth?: UserAuthObjectionModel;
    userCards?: UserCardObjectionModel[];
}

export interface IUserAuthObjectionModel {
    userId: number;
    username: string;
    role: number;
    hashedPassword: string;
    user?: IUserObjectionModel;
}

export class UserAuthObjectionModel extends Model implements IUserAuthObjectionModel {
    static tableName = 'UserAuth';
    static idColumn = 'userId';

    static relationMappings: RelationMappingsThunk = () => ({
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
                from: 'User.id',
                to: 'UserAuth.userId',
            },
        },
    });

    userId!: number;
    username!: string;
    role!: number;
    hashedPassword!: string;
    user?: UserObjectionModel;
}
