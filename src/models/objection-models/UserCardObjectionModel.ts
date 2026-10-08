import { Model, RelationMappingsThunk } from 'objection';
import { BaseObjectionModel } from '.';
import { UserObjectionModel } from './UserObjectionModel';

export interface IUserCardObjectionModel extends BaseObjectionModel {
    id?: number;
    userId: number;
    cardName: string;
    hashedCardId: string;
    created?: string;
    updated?: string;
    user?: UserObjectionModel;
}

export class UserCardObjectionModel extends Model implements IUserCardObjectionModel {
    static tableName = 'UserCard';

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
                from: 'UserCard.userId',
                to: 'User.id',
            },
        },
    });

    id?: number;
    userId!: number;
    cardName!: string;
    hashedCardId!: string;
    created?: string;
    updated?: string;
    user?: UserObjectionModel;
}
