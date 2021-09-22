import { Model, RelationMappingsThunk } from 'objection';
import { BaseObjectionModelWithName, UserObjectionModel } from '.';
import { IUserObjectionModel } from './UserObjectionModel';

export interface IEventObjectionModel extends BaseObjectionModelWithName {
    id: number;
    name: string;
    created: string;
    updated: string;
    ownerUser?: IUserObjectionModel;
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

export class EventObjectionModel extends Model {
    static tableName = 'Event';

    static relationMappings: RelationMappingsThunk = () => ({
        ownerUser: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserObjectionModel,
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
    ownerUser!: UserObjectionModel;
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
