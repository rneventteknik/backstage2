import { Model, RelationMappingsThunk } from 'objection';
import { UserApiModel } from '.';

export class EventApiModel extends Model {
    static tableName = 'event';

    static relationMappings: RelationMappingsThunk = () => ({
        ownerUser: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserApiModel,
            join: {
                from: 'event.ownerUserId',
                to: 'user.id',
            },
        },
    });

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
    ownerUser!: UserApiModel;
    eventType!: number;
    status!: number;
    salaryStatus!: number;
    invoiceHoogiaId!: number;
    invoiceAddress!: string;
    invoiceTag!: string;
    invoicenumber!: string;
    note!: string;
    returnalNote!: string;
    pricePlan!: number;
    accountKind!: number;
    location!: string;
    contactPersonName!: string;
    contactPersonPhone!: string;
    contactPersonEmail!: string;
}
