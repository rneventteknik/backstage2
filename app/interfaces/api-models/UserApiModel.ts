import { Model, RelationMappingsThunk } from 'objection';
import { EventApiModel } from '.';

export class UserApiModel extends Model {
    static tableName = 'user';

    static relationMappings: RelationMappingsThunk = () => ({
        OwnsEvent: {
            relation: Model.HasManyRelation,
            modelClass: EventApiModel,
            join: {
                from: 'user.id',
                to: 'event.ownerUserId',
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

    events?: EventApiModel[];
}
