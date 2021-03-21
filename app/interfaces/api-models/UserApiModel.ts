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

    Id!: number;
    Name!: string;
    Created!: string;
    Updated!: string;
    Role!: number;
    MemberStatus!: number;
    NameTag!: string;
    PhoneNumber!: string;
    SlackId!: string;

    Events?: EventApiModel[];
}
