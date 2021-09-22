import { Model, RelationMappingsThunk } from 'objection';
import { BaseObjectionModelWithName, EventObjectionModel } from '.';
import { IEventObjectionModel } from './EventObjectionModel';

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

    // The below properties contain personal information and are threrefore not included in all api endpoints.
    personalIdentityNumber?: string;
    bankName?: string;
    clearingNumber?: string;
    bankAccount?: string;
    homeAddress?: string;
    zipCode?: string;

    events?: IEventObjectionModel[];
    userAuth?: IUserAuthObjectionModel;
}

export class UserObjectionModel extends Model implements IUserObjectionModel {
    static tableName = 'User';

    static relationMappings: RelationMappingsThunk = () => ({
        events: {
            relation: Model.HasManyRelation,
            modelClass: EventObjectionModel,
            join: {
                from: 'User.id',
                to: 'Event.ownerUserId',
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
    zipCode!: string;
    emailAddress!: string;

    events?: EventObjectionModel[];
    userAuth?: UserAuthObjectionModel;
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
