import { Model, RelationMappingsThunk } from 'objection';
import { BaseApiModelWithName, UserApiModel } from '.';
import { IUserApiModel } from './UserApiModel';

export interface IEventApiModel extends BaseApiModelWithName {
    id: number;
    name: string;
    created: string;
    updated: string;
    ownerUser: IUserApiModel;
    eventType: number;
    status: number;
    salaryStatus: number;
    invoiceHoogiaId: number;
    invoiceAddress: string;
    invoiceTag: string;
    invoicenumber: string;
    note: string;
    returnalNote: string;
    pricePlan: number;
    accountKind: number;
    location: string;
    contactPersonName: string;
    contactPersonPhone: string;
    contactPersonEmail: string;
}

export class EventApiModel extends Model {
    static tableName = 'Event';

    static relationMappings: RelationMappingsThunk = () => ({
        ownerUser: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserApiModel,
            join: {
                from: 'Event.ownerUserId',
                to: 'User.id',
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
