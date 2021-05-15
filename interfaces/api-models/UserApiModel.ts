import { Model, RelationMappingsThunk } from 'objection';
import { EventApiModel } from '.';

export class UserApiModel extends Model {
    static tableName = 'user';

    static relationMappings: RelationMappingsThunk = () => ({
        events: {
            relation: Model.HasManyRelation,
            modelClass: EventApiModel,
            join: {
                from: 'user.id',
                to: 'event.ownerUserId',
            },
        },
        userAuth: {
            relation: Model.HasOneRelation,
            modelClass: UserAuthApiModel,
            join: {
                from: 'user.id',
                to: 'userauth.id',
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
    static tableName = 'userauth';

    static relationMappings: RelationMappingsThunk = () => ({
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserApiModel,
            join: {
                from: 'userauth.id',
                to: 'user.id',
            },
        },
    });

    id!: number;
    username!: string;
    hashedPassword!: string;
    user?: UserApiModel;
}
