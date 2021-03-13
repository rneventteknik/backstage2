import { Model, RelationMappingsThunk } from 'objection';
import { UserApiModel } from '.';

export class EventApiModel extends Model {
    static tableName = 'Event';

    static relationMappings: RelationMappingsThunk = () => ({
        OwnerUser: {
            relation: Model.HasOneRelation,
            modelClass: UserApiModel,
            join: {
                from: 'Event.OwnerUserId',
                to: 'User.Id',
            },
        },
    });

    Id!: number;
    Name!: string;
    Created!: string;
    Updated!: string;
    OwnerUser!: UserApiModel;
    EventType!: number;
    Status!: number;
    SalaryStatus!: number;
    InvoiceHoogiaId!: number;
    InvoiceAddress!: string;
    InvoiceTag!: string;
    Invoicenumber!: string;
    Note!: string;
    ReturnalNote!: string;
    PricePlan!: number;
    AccountKind!: number;
    Location!: string;
    ContactPersonName!: string;
    ContactPersonPhone!: string;
    ContactPersonEmail!: string;
}
