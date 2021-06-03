import { Model, RelationMappingsThunk } from 'objection';
import { EventApiModel } from '.';

export class UserApiModel extends Model {
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
            join: {
                from: 'User.id',
                to: 'UserAuth.id',
            },
        },
    });

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
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
    authUser?: UserAuthApiModel[];
}

export class UserAuthApiModel extends Model {
    static tableName = 'UserAuth';

    static relationMappings: RelationMappingsThunk = () => ({
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserApiModel,
            join: {
                from: 'UserAuth.id',
                to: 'User.id',
            },
        },
    });

    id!: number;
    username!: string;
    hashedPassword!: string;
    user?: UserApiModel;
}
