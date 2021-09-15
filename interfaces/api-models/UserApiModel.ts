import { Model, RelationMappingsThunk } from 'objection';
import { BaseApiModelWithName, EventApiModel } from '.';
import { IEventApiModel } from './EventApiModel';

export interface IUserApiModel extends BaseApiModelWithName {
    id?: number;
    name: string;
    created?: string;
    updated?: string;
    role: number;
    memberStatus: number;
    nameTag: string;
    phoneNumber: string;
    slackId: string;
    emailAddress: string;

    // The below properties contain personal information and are threrefore not included in all api endpoints.
    personalIdentityNumber?: string;
    bankName?: string;
    clearingNumber?: string;
    bankAccount?: string;
    homeAddress?: string;
    zipCode?: string;

    events?: IEventApiModel[];
    userAuth?: IUserAuthApiModel;
}

export class UserApiModel extends Model implements IUserApiModel {
    static tableName = 'User';

    static relationMappings: RelationMappingsThunk = () => ({
        events: {
            relation: Model.HasManyRelation,
            modelClass: EventApiModel,
            join: {
                from: 'User.id',
                to: 'Event.ownerUserId',
            },
        },
        userAuth: {
            relation: Model.HasOneRelation,
            modelClass: UserAuthApiModel,
            filter: (query) => query.select('userId', 'username'),
            join: {
                from: 'User.id',
                to: 'UserAuth.userId',
            },
        },
    });

    id?: number;
    name!: string;
    created?: string;
    updated?: string;
    role!: number;
    memberStatus!: number;
    nameTag!: string;
    phoneNumber!: string;
    slackId!: string;
    personalIdentityNumber!: string;
    bankName!: string;
    clearingNumber!: string;
    bankAccount!: string;
    homeAddress!: string;
    zipCode!: string;
    emailAddress!: string;

    events?: EventApiModel[];
    userAuth?: UserAuthApiModel;
}

export interface IUserAuthApiModel {
    userId: number;
    username: string;
    hashedPassword: string;
    user?: IUserApiModel;
}

export class UserAuthApiModel extends Model implements IUserAuthApiModel {
    static tableName = 'UserAuth';
    static idColumn = 'userId';

    static relationMappings: RelationMappingsThunk = () => ({
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserApiModel,
            join: {
                from: 'User.id',
                to: 'UserAuth.userId',
            },
        },
    });

    userId!: number;
    username!: string;
    hashedPassword!: string;
    user?: UserApiModel;
}
